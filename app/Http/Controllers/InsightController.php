<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Rental;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class InsightController extends Controller
{
    private const CACHE_KEY = 'admin.insight.v1';

    private const CACHE_MINUTES = 30;

    /**
     * Weekly insight for the admin overview banner, generated from real rental data.
     */
    public function show(Request $request): JsonResponse
    {
        if ($request->boolean('refresh')) {
            Cache::forget(self::CACHE_KEY);
        }

        $insight = Cache::remember(
            self::CACHE_KEY,
            now()->addMinutes(self::CACHE_MINUTES),
            fn () => $this->generate(),
        );

        return response()->json($insight);
    }

    /**
     * @return array<string, mixed>
     */
    private function generate(): array
    {
        $metrics = $this->metrics();
        $fallback = $this->fallbackInsight($metrics);

        $apiKey = config('services.groq.key');

        if (blank($apiKey)) {
            return $fallback;
        }

        $model = (string) config('services.groq.model', 'qwen/qwen3.8-27b');

        try {
            $response = Http::withToken($apiKey)
                ->acceptJson()
                ->timeout(20)
                ->post(config('services.groq.url'), [
                    'model' => $model,
                    'temperature' => 0.4,
                    'max_tokens' => 700,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Kamu adalah analis operasional rental kamera. Kamu menerima data ringkas dashboard admin dalam bentuk JSON. Tulis insight mingguan dalam bahasa Indonesia yang profesional namun santai. Gunakan HANYA angka dan nama produk dari data yang diberikan, jangan mengarang. Jawab HANYA dengan JSON valid dengan bentuk: {"headline": string (maksimal 8 kata), "summary": string (maksimal 2 kalimat, 200 karakter), "details": array berisi 3 atau 4 string (masing-masing maksimal 140 karakter), "recommendation": string (satu kalimat aksi konkret)}.',
                        ],
                        [
                            'role' => 'user',
                            'content' => 'Data dashboard rental kamera per '.now()->translatedFormat('d F Y').': '.json_encode($metrics, JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Groq insight request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $fallback;
            }

            $content = (string) $response->json('choices.0.message.content');
            $data = $this->parseJson($content);

            if ($data === null) {
                Log::warning('Groq insight returned unparsable content', ['content' => $content]);

                return $fallback;
            }

            return $this->normalizeInsight($data, $metrics, $model);
        } catch (Throwable $exception) {
            Log::warning('Groq insight request threw an exception', ['message' => $exception->getMessage()]);

            return $fallback;
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function metrics(): array
    {
        $today = now()->toDateString();
        $weekStart = now()->subDays(6)->startOfDay()->toDateString();
        $monthStart = now()->subDays(29)->startOfDay()->toDateString();

        $products = Camera::query()->get();
        $totalUnits = (int) $products->sum('stok');

        $ongoing = Rental::query()
            ->whereIn('status_sewa', Rental::ACTIVE_STATUSES)
            ->whereDate('tanggal_sewa', '<=', $today)
            ->whereDate('tanggal_kembali', '>=', $today)
            ->count();

        $pending = Rental::query()->where('status_sewa', 'menunggu_persetujuan')->count();

        $weeklyRevenue = (float) Rental::query()
            ->whereIn('status_sewa', ['disetujui', 'sedang_disewa', 'selesai'])
            ->whereBetween('tanggal_sewa', [$weekStart, $today])
            ->sum('total_biaya');

        $top = Rental::query()
            ->selectRaw('id_produk, COUNT(*) as total')
            ->whereDate('tanggal_sewa', '>=', $monthStart)
            ->whereIn('status_sewa', ['disetujui', 'sedang_disewa', 'selesai'])
            ->groupBy('id_produk')
            ->orderByDesc('total')
            ->first();

        $topProduct = $top ? Camera::query()->find($top->id_produk) : null;

        $availableUnits = max(0, $totalUnits - $ongoing);

        return [
            'total_products' => $products->count(),
            'total_units' => $totalUnits,
            'available_units' => $availableUnits,
            'ongoing_rentals' => $ongoing,
            'pending_rentals' => $pending,
            'weekly_revenue' => $weeklyRevenue,
            'weekly_revenue_label' => 'Rp '.number_format($weeklyRevenue, 0, ',', '.'),
            'top_product' => $topProduct?->nama_produk,
            'top_product_rentals' => $top ? (int) $top->total : 0,
            'rentals_last_30_days' => Rental::query()
                ->whereDate('tanggal_sewa', '>=', $monthStart)
                ->count(),
            'low_stock_products' => $products
                ->filter(fn (Camera $camera) => (int) $camera->stok <= 1)
                ->take(4)
                ->map(fn (Camera $camera) => ['name' => $camera->nama_produk, 'stock' => (int) $camera->stok])
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $metrics
     * @return array<string, mixed>
     */
    private function fallbackInsight(array $metrics): array
    {
        if ($metrics['total_products'] === 0) {
            return $this->shape([
                'headline' => 'Belum ada kamera di katalog',
                'summary' => 'Tambahkan kamera pertama agar insight penjualan mulai terbentuk.',
                'details' => [
                    'Katalog masih kosong sehingga belum ada data penyewaan yang bisa dianalisis.',
                    'Lengkapi nama, jenis, harga sewa, dan stok setiap unit kamera.',
                    'Insight otomatis akan muncul setelah transaksi pertama tercatat.',
                ],
                'recommendation' => 'Mulai dengan menambahkan 2–3 kamera paling sering diminta pelanggan.',
            ], $metrics, null, 'fallback');
        }

        $details = [
            "{$metrics['ongoing_rentals']} penyewaan sedang aktif dengan {$metrics['available_units']} dari {$metrics['total_units']} unit tersedia.",
            "Pendapatan 7 hari terakhir tercatat {$metrics['weekly_revenue_label']}.",
        ];

        if ($metrics['top_product']) {
            $details[] = "{$metrics['top_product']} paling sering disewa dalam 30 hari terakhir ({$metrics['top_product_rentals']} transaksi).";
        }

        if ($metrics['pending_rentals'] > 0) {
            $details[] = "{$metrics['pending_rentals']} pengajuan masih menunggu persetujuan admin.";
        }

        if ($metrics['pending_rentals'] > 0) {
            return $this->shape([
                'headline' => 'Pengajuan menunggu persetujuan',
                'summary' => "Ada {$metrics['pending_rentals']} pengajuan yang belum diproses. Segera tinjau agar jadwal sewa tidak bentrok.",
                'details' => $details,
                'recommendation' => 'Buka menu Penyewaan dan setujui atau tolak pengajuan yang paling dekat tanggal sewanya.',
            ], $metrics, null, 'fallback');
        }

        if ($metrics['available_units'] === 0) {
            return $this->shape([
                'headline' => 'Semua unit sedang tersewa',
                'summary' => 'Tidak ada unit tersedia saat ini. Pertimbangkan menambah stok untuk menangkap permintaan berikutnya.',
                'details' => $details,
                'recommendation' => 'Tambahkan minimal 1 unit kamera terpopuler atau atur jadwal pengembalian lebih ketat.',
            ], $metrics, null, 'fallback');
        }

        $headline = $metrics['top_product']
            ? "{$metrics['top_product']} paling diminati"
            : 'Operasional rental stabil';

        $summary = $metrics['top_product']
            ? "{$metrics['top_product']} memimpin permintaan 30 hari terakhir. Pertimbangkan menambah 1 unit untuk menangkap permintaan akhir pekan."
            : "Tidak ada lonjakan permintaan yang menonjol minggu ini. {$metrics['available_units']} unit siap disewakan.";

        return $this->shape([
            'headline' => $headline,
            'summary' => $summary,
            'details' => $details,
            'recommendation' => 'Pantau stok kamera terlaris dan pastikan unit siap pakai sebelum akhir pekan.',
        ], $metrics, null, 'fallback');
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $metrics
     * @return array<string, mixed>
     */
    private function normalizeInsight(array $data, array $metrics, string $model): array
    {
        $headline = $this->cleanText($data['headline'] ?? '', 90);
        $summary = $this->cleanText($data['summary'] ?? '', 240);
        $recommendation = $this->cleanText($data['recommendation'] ?? '', 240);

        $details = collect($data['details'] ?? [])
            ->filter(fn ($detail) => is_string($detail) && trim($detail) !== '')
            ->map(fn ($detail) => $this->cleanText($detail, 180))
            ->take(4)
            ->values()
            ->all();

        if ($headline === '' || $summary === '' || $details === []) {
            return $this->fallbackInsight($metrics);
        }

        return $this->shape([
            'headline' => $headline,
            'summary' => $summary,
            'details' => $details,
            'recommendation' => $recommendation,
        ], $metrics, $model, 'groq');
    }

    /**
     * @param  array<string, mixed>  $content
     * @param  array<string, mixed>  $metrics
     * @return array<string, mixed>
     */
    private function shape(array $content, array $metrics, ?string $model, string $source): array
    {
        return [
            'headline' => $content['headline'],
            'summary' => $content['summary'],
            'details' => array_values($content['details']),
            'recommendation' => $content['recommendation'] ?? '',
            'metrics' => [
                'ongoing_rentals' => $metrics['ongoing_rentals'],
                'pending_rentals' => $metrics['pending_rentals'],
                'weekly_revenue' => (float) $metrics['weekly_revenue'],
                'available_units' => $metrics['available_units'],
                'total_units' => $metrics['total_units'],
                'top_product' => $metrics['top_product'],
                'top_product_rentals' => $metrics['top_product_rentals'],
                'rentals_last_30_days' => $metrics['rentals_last_30_days'],
            ],
            'source' => $source,
            'model' => $model,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function parseJson(string $content): ?array
    {
        $content = trim($content);
        $content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $content) ?? $content;

        $data = json_decode($content, true);

        if (! is_array($data)) {
            $start = strpos($content, '{');
            $end = strrpos($content, '}');

            if ($start === false || $end === false || $end <= $start) {
                return null;
            }

            $data = json_decode(substr($content, $start, $end - $start + 1), true);
        }

        return is_array($data) ? $data : null;
    }

    private function cleanText(mixed $value, int $limit): string
    {
        if (! is_string($value)) {
            return '';
        }

        $value = trim(preg_replace('/\s+/', ' ', strip_tags($value)) ?? '');

        return mb_strlen($value) > $limit ? mb_substr($value, 0, $limit - 1).'…' : $value;
    }
}

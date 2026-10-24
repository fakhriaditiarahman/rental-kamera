<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class Camera extends Model
{
    protected $table = 'produk';

    public $timestamps = false;

    protected $primaryKey = 'id_produk';

    protected $fillable = ['nama_produk', 'jenis_kamera', 'harga_sewa', 'stok', 'status_ketersediaan'];

    /**
     * Shape used by the admin workspace views.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public static function adminList(): Collection
    {
        return static::query()->orderBy('nama_produk')->get()->values()->map(fn ($camera, $index) => [
            'id' => $camera->id_produk,
            'name' => $camera->nama_produk,
            'type' => $camera->jenis_kamera,
            'rate' => (float) $camera->harga_sewa,
            'stock' => (int) $camera->stok,
            'status' => $camera->status_ketersediaan,
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
            'tag' => 'Koleksi',
        ]);
    }

    /**
     * Cameras with the remaining stock for a rental period.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public static function availabilityList(string $startDate, string $endDate): Collection
    {
        $bookings = Rental::query()
            ->whereIn('status_sewa', Rental::ACTIVE_STATUSES)
            ->whereDate('tanggal_sewa', '<=', $endDate)
            ->whereDate('tanggal_kembali', '>=', $startDate)
            ->selectRaw('id_produk, COUNT(*) as total')
            ->groupBy('id_produk')
            ->pluck('total', 'id_produk');

        return static::query()
            ->where('status_ketersediaan', '!=', 'Tidak tersedia')
            ->orderBy('nama_produk')
            ->get()
            ->values()
            ->map(function ($camera, $index) use ($bookings) {
                $booked = (int) ($bookings[$camera->id_produk] ?? 0);
                $remaining = max(0, (int) $camera->stok - $booked);
                $available = $remaining > 0;

                return [
                    'id' => $camera->id_produk,
                    'name' => $camera->nama_produk,
                    'type' => $camera->jenis_kamera,
                    'rate' => (float) $camera->harga_sewa,
                    'stock' => (int) $camera->stok,
                    'status' => $available ? ($remaining === 1 ? 'Terbatas' : 'Tersedia') : 'Tidak tersedia',
                    'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
                    'tag' => 'Koleksi',
                    'available' => $available,
                    'availableStock' => $remaining,
                    'bookedStock' => $booked,
                ];
            });
    }

    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    public function getNameAttribute(): string
    {
        return $this->nama_produk;
    }

    public function getTypeAttribute(): string
    {
        return $this->jenis_kamera;
    }

    public function getDailyRateAttribute(): mixed
    {
        return $this->harga_sewa;
    }

    public function getStockAttribute(): int
    {
        return $this->stok;
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class, 'id_produk', 'id_produk');
    }
}

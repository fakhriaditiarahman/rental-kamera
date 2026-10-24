<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = User::query()
            ->where('role', 'customer')
            ->with(['rentals' => fn ($query) => $query
                ->with('camera')
                ->orderByDesc('tanggal_sewa')
                ->orderByDesc('id_transaksi'),
            ])
            ->orderBy('nama_pelanggan')
            ->get()
            ->values()
            ->map(fn (User $customer, int $index) => $this->toContract($customer, $index));

        return Inertia::render('App', [
            'title' => 'Pelanggan',
            'cameras' => Camera::adminList(),
            'customers' => $customers,
            'customerSummary' => [
                'total' => $customers->count(),
                'active' => $customers->where('status', 'Sedang menyewa')->count(),
                'new_this_month' => User::query()
                    ->where('role', 'customer')
                    ->where('created_at', '>=', now()->startOfMonth())
                    ->count(),
                'completed_revenue' => (float) Rental::query()
                    ->where('status_sewa', 'selesai')
                    ->whereHas('user', fn ($query) => $query->where('role', 'customer'))
                    ->sum('total_biaya'),
            ],
        ]);
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('App', [
            'title' => 'Dashboard Pelanggan',
            ...$this->customerPayload($request->user()),
        ]);
    }

    public function rentals(Request $request)
    {
        $payload = $this->customerPayload($request->user());

        return Inertia::render('App', [
            'title' => 'Sewa saya',
            ...$payload,
            'customerRentalSummary' => $this->rentalSummary($payload['rentals']),
        ]);
    }

    /**
     * Shared props for every customer page. The SPA keeps these props while
     * navigating between /pelanggan routes, so all customer pages receive the
     * same rental payload.
     *
     * @return array<string, mixed>
     */
    private function customerPayload(User $user): array
    {
        $rentals = $user->rentals()
            ->with('camera')
            ->orderByDesc('tanggal_sewa')
            ->orderByDesc('id_transaksi')
            ->get()
            ->values();

        return [
            'customer' => [
                'id' => $user->id_pelanggan,
                'name' => $user->name,
                'phone' => $user->phone,
                'address' => $user->address,
            ],
            'rentals' => $rentals->map(fn (Rental $rental, int $index) => $this->rentalRow($rental, $index))->all(),
            'cameras' => Camera::adminList(),
        ];
    }

    /**
     * Shape used by the customer "Sewa saya" module.
     *
     * @return array<string, mixed>
     */
    private function rentalRow(Rental $rental, int $index): array
    {
        return [
            'id' => $rental->transaction_code,
            'product' => $rental->camera->name,
            'type' => $rental->camera->type,
            'startDate' => $rental->start_date?->toDateString(),
            'endDate' => $rental->end_date?->toDateString(),
            'dates' => $rental->start_date->translatedFormat('d M Y').' — '.$rental->end_date->translatedFormat('d M Y'),
            'duration' => (int) $rental->durasi_sewa,
            'rate' => (float) $rental->harga_sewa_saat_transaksi,
            'total' => (float) $rental->total_amount,
            'status' => $rental->status_label,
            'statusCode' => $rental->status_sewa,
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
            'pickedUpAt' => $rental->picked_up_at?->translatedFormat('d M Y H:i'),
            'returnedAt' => $rental->returned_at?->translatedFormat('d M Y H:i'),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $rentals
     * @return array<string, mixed>
     */
    private function rentalSummary(array $rentals): array
    {
        $collection = collect($rentals);
        $active = $collection->whereIn('statusCode', Rental::ACTIVE_STATUSES);
        $nextReturn = $active
            ->whereIn('statusCode', ['disetujui', 'sedang_disewa'])
            ->sortBy('endDate')
            ->first();

        return [
            'total' => $collection->count(),
            'active' => $active->count(),
            'pending' => $collection->where('statusCode', 'menunggu_persetujuan')->count(),
            'completed' => $collection->where('statusCode', 'selesai')->count(),
            'total_spent' => (float) $collection->where('statusCode', 'selesai')->sum('total'),
            'next_return_at' => $nextReturn ? Carbon::parse($nextReturn['endDate'])->translatedFormat('d M Y') : null,
        ];
    }

    /**
     * Shape used by the admin customer module.
     *
     * @return array<string, mixed>
     */
    private function toContract(User $customer, int $index): array
    {
        $rentals = $customer->rentals;
        $activeRentals = $rentals->whereIn('status_sewa', Rental::ACTIVE_STATUSES);
        $completedRentals = $rentals->where('status_sewa', 'selesai');
        $lastRental = $rentals->first();

        return [
            'id' => $customer->id_pelanggan,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'joinedAt' => $customer->created_at?->translatedFormat('d M Y'),
            'rentalCount' => $rentals->count(),
            'activeRentalCount' => $activeRentals->count(),
            'completedRentalCount' => $completedRentals->count(),
            'totalSpent' => (float) $completedRentals->sum('total_biaya'),
            'lastRentalAt' => $lastRental?->tanggal_sewa?->translatedFormat('d M Y'),
            'status' => $this->status($rentals, $activeRentals),
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
            'rentals' => $this->rentalHistory($rentals),
        ];
    }

    /**
     * @param  Collection<int, Rental>  $rentals
     * @param  Collection<int, Rental>  $activeRentals
     */
    private function status(Collection $rentals, Collection $activeRentals): string
    {
        if ($activeRentals->isNotEmpty()) {
            return 'Sedang menyewa';
        }

        return $rentals->isNotEmpty() ? 'Pernah menyewa' : 'Belum pernah menyewa';
    }

    /**
     * @param  Collection<int, Rental>  $rentals
     * @return Collection<int, array<string, mixed>>
     */
    private function rentalHistory(Collection $rentals): Collection
    {
        return $rentals->values()->map(fn (Rental $rental, int $index) => [
            'id' => $rental->transaction_code,
            'product' => $rental->camera->name,
            'dates' => $rental->start_date->translatedFormat('d M Y').' — '.$rental->end_date->translatedFormat('d M Y'),
            'duration' => (int) $rental->durasi_sewa,
            'total' => (float) $rental->total_amount,
            'status' => $rental->status_label,
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
        ]);
    }
}

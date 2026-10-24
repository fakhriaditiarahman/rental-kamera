<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        $cameras = Camera::query()
            ->with(['rentals' => fn ($query) => $query
                ->whereIn('status_sewa', Rental::ACTIVE_STATUSES)
                ->whereDate('tanggal_sewa', '<=', $today)
                ->whereDate('tanggal_kembali', '>=', $today)
                ->with('user')
                ->orderBy('tanggal_kembali')
                ->orderBy('id_transaksi'),
            ])
            ->orderBy('nama_produk')
            ->get();

        $inventory = $cameras->values()->map(fn (Camera $camera, int $index) => $this->toContract($camera, $index));

        return Inertia::render('App', [
            'title' => 'Inventaris',
            'cameras' => Camera::adminList(),
            'inventory' => $inventory,
            'inventorySummary' => [
                'total_products' => $inventory->count(),
                'total_units' => (int) $cameras->sum('stok'),
                'rented_units' => (int) $inventory->sum('rentedUnits'),
                'available_units' => (int) $inventory->sum('availableUnits'),
                'attention_products' => $inventory->where('availableUnits', 0)->count(),
                'daily_value' => (float) $cameras->sum(fn (Camera $camera) => (float) $camera->harga_sewa * (int) $camera->stok),
            ],
        ]);
    }

    public function update(Request $request, Camera $camera)
    {
        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0', 'max:999'],
            'status' => ['required', 'in:Tersedia,Terbatas,Disewa,Tidak tersedia'],
        ], [
            'stock.required' => 'Stok wajib diisi.',
            'stock.integer' => 'Stok harus berupa angka bulat.',
            'stock.min' => 'Stok tidak boleh bernilai negatif.',
            'stock.max' => 'Stok maksimal 999 unit.',
            'status.required' => 'Status ketersediaan wajib dipilih.',
            'status.in' => 'Status ketersediaan tidak valid.',
        ]);

        $rentedUnits = $this->ongoingRentals($camera)->count();

        if ($data['stock'] < $rentedUnits) {
            throw ValidationException::withMessages([
                'stock' => "Stok tidak boleh lebih kecil dari {$rentedUnits} unit yang sedang disewa.",
            ]);
        }

        $camera->update([
            'stok' => $data['stock'],
            'status_ketersediaan' => $data['status'],
        ]);

        return redirect()->route('admin.inventory')->with('success', 'Inventaris kamera berhasil diperbarui.');
    }

    /**
     * Shape used by the admin inventory module.
     *
     * @return array<string, mixed>
     */
    private function toContract(Camera $camera, int $index): array
    {
        $stock = (int) $camera->stok;
        $ongoingRentals = $camera->rentals;
        $rentedUnits = $ongoingRentals->count();
        $availableUnits = max(0, $stock - $rentedUnits);

        return [
            'id' => $camera->id_produk,
            'name' => $camera->nama_produk,
            'type' => $camera->jenis_kamera,
            'rate' => (float) $camera->harga_sewa,
            'stock' => $stock,
            'status' => $camera->status_ketersediaan,
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
            'rentedUnits' => $rentedUnits,
            'availableUnits' => $availableUnits,
            'utilization' => $stock > 0 ? (int) round($rentedUnits / $stock * 100) : 0,
            'nextReturnAt' => $ongoingRentals->first()?->tanggal_kembali?->translatedFormat('d M Y'),
            'ongoingRentals' => $this->ongoingRentalRows($ongoingRentals),
        ];
    }

    /**
     * @return Collection<int, Rental>
     */
    private function ongoingRentals(Camera $camera): Collection
    {
        $today = now()->toDateString();

        return Rental::query()
            ->where('id_produk', $camera->id_produk)
            ->whereIn('status_sewa', Rental::ACTIVE_STATUSES)
            ->whereDate('tanggal_sewa', '<=', $today)
            ->whereDate('tanggal_kembali', '>=', $today)
            ->get();
    }

    /**
     * @param  Collection<int, Rental>  $rentals
     * @return Collection<int, array<string, mixed>>
     */
    private function ongoingRentalRows(Collection $rentals): Collection
    {
        return $rentals->values()->map(fn (Rental $rental) => [
            'id' => $rental->transaction_code,
            'customer' => $rental->user?->name ?? 'Pelanggan',
            'dates' => $rental->start_date->translatedFormat('d M Y').' — '.$rental->end_date->translatedFormat('d M Y'),
            'returnAt' => $rental->end_date->translatedFormat('d M Y'),
            'status' => $rental->status_label,
        ]);
    }
}

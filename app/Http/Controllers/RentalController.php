<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'camera_id' => ['required', 'exists:produk,id_produk'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ], [
            'camera_id.required' => 'Kamera wajib dipilih.',
            'camera_id.exists' => 'Kamera tidak ditemukan.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'start_date.after_or_equal' => 'Tanggal mulai tidak boleh sebelum hari ini.',
            'end_date.required' => 'Tanggal kembali wajib diisi.',
            'end_date.date' => 'Tanggal kembali tidak valid.',
            'end_date.after_or_equal' => 'Tanggal kembali tidak boleh sebelum tanggal mulai.',
        ]);

        $rental = DB::transaction(function () use ($data, $request) {
            $camera = Camera::query()->whereKey($data['camera_id'])->lockForUpdate()->firstOrFail();
            $start = Carbon::parse($data['start_date']);
            $end = Carbon::parse($data['end_date']);
            $duration = $start->diffInDays($end) + 1;

            $activeBookings = Rental::query()
                ->where('id_produk', $camera->id_produk)
                ->whereIn('status_sewa', Rental::ACTIVE_STATUSES)
                ->whereDate('tanggal_sewa', '<=', $end)
                ->whereDate('tanggal_kembali', '>=', $start)
                ->count();

            if ($activeBookings >= $camera->stock) {
                throw ValidationException::withMessages([
                    'start_date' => 'Kamera tidak tersedia pada periode tersebut. Silakan pilih tanggal lain.',
                ]);
            }

            return Rental::create([
                'kode_transaksi' => 'SK-'.now()->format('ymdHis').'-'.str()->upper(str()->random(4)),
                'id_pelanggan' => $request->user()->id_pelanggan,
                'id_produk' => $camera->id_produk,
                'tanggal_sewa' => $start,
                'tanggal_kembali' => $end,
                'durasi_sewa' => $duration,
                'harga_sewa_saat_transaksi' => $camera->harga_sewa,
                'total_biaya' => $duration * $camera->harga_sewa,
                'status_sewa' => 'menunggu_persetujuan',
            ]);
        });

        return back()->with('success', 'Pengajuan sewa berhasil dibuat.');
    }

    public function updateStatus(Request $request, Rental $rental)
    {
        $data = $request->validate([
            'status' => ['required', 'in:disetujui,ditolak,sedang_disewa,selesai,dibatalkan'],
        ]);

        $rental->update([
            'status_sewa' => $data['status'],
            'picked_up_at' => $data['status'] === 'sedang_disewa' ? now() : $rental->picked_up_at,
            'returned_at' => $data['status'] === 'selesai' ? now() : $rental->returned_at,
        ]);

        return back()->with('success', 'Status transaksi diperbarui.');
    }
}

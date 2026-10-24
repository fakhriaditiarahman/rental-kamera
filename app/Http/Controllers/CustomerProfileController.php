<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CustomerProfileController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $rentals = $user->rentals()
            ->with('camera')
            ->orderByDesc('tanggal_sewa')
            ->orderByDesc('id_transaksi')
            ->get();

        $activeRentals = $rentals->whereIn('status_sewa', Rental::ACTIVE_STATUSES);
        $completedRentals = $rentals->where('status_sewa', 'selesai');

        return Inertia::render('App', [
            'title' => 'Profil saya',
            'cameras' => Camera::adminList(),
            'profile' => [
                'id' => $user->id_pelanggan,
                'name' => $user->name,
                'phone' => $user->phone,
                'address' => $user->address,
                'joinedAt' => $user->created_at?->translatedFormat('d M Y'),
                'role' => 'Pelanggan',
            ],
            'profileSummary' => [
                'rental_count' => $rentals->count(),
                'active_rental_count' => $activeRentals->count(),
                'completed_rental_count' => $completedRentals->count(),
                'total_spent' => (float) $completedRentals->sum('total_biaya'),
                'last_rental_at' => $rentals->first()?->tanggal_sewa?->translatedFormat('d M Y'),
                'favorite_camera' => $rentals
                    ->map(fn (Rental $rental) => $rental->camera?->name)
                    ->filter()
                    ->countBy()
                    ->sortDesc()
                    ->keys()
                    ->first(),
            ],
            'rentals' => $this->rentalRows($rentals),
        ]);
    }

    public function update(Request $request)
    {
        $request->merge([
            'name' => trim((string) $request->input('name')),
            'phone' => preg_replace('/[\s-]/', '', (string) $request->input('phone')),
            'address' => trim((string) $request->input('address')),
        ]);

        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'phone' => [
                'required',
                'regex:/^(?:\+62|62|0)8[1-9][0-9]{7,11}$/',
                'max:20',
                Rule::unique('pelanggan', 'no_telepon')->ignore($user->id_pelanggan, 'id_pelanggan'),
            ],
            'address' => ['required', 'string', 'max:1000'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.regex' => 'Masukkan nomor telepon yang valid.',
            'phone.unique' => 'Nomor telepon sudah dipakai akun lain.',
            'address.required' => 'Alamat wajib diisi.',
        ]);

        $user->update([
            'nama_pelanggan' => $data['name'],
            'no_telepon' => $data['phone'],
            'alamat' => $data['address'],
        ]);

        return redirect()
            ->route('customer.profile')
            ->with('success', 'Profil kamu berhasil diperbarui.');
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'password.required' => 'Password baru wajib diisi.',
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru harus sama.',
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password_hash)) {
            throw ValidationException::withMessages([
                'current_password' => 'Password saat ini tidak sesuai.',
            ]);
        }

        $user->update([
            'password_hash' => Hash::make($data['password']),
        ]);

        $request->session()->regenerate();

        return redirect()
            ->route('customer.profile')
            ->with('success', 'Password berhasil diperbarui.');
    }

    /**
     * @param  Collection<int, Rental>  $rentals
     * @return Collection<int, array<string, mixed>>
     */
    private function rentalRows(Collection $rentals): Collection
    {
        return $rentals->values()->map(fn (Rental $rental, int $index) => [
            'id' => $rental->transaction_code,
            'product' => $rental->camera?->name ?? 'Kamera',
            'dates' => $rental->start_date->translatedFormat('d M Y').' — '.$rental->end_date->translatedFormat('d M Y'),
            'total' => (float) $rental->total_amount,
            'status' => $rental->status_label,
            'tone' => ['sand', 'clay', 'sage', 'ink'][$index % 4],
        ]);
    }
}

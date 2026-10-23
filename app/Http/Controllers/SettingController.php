<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('App', [
            'title' => 'Pengaturan',
            'cameras' => Camera::adminList(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama_usaha' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'no_telepon' => ['nullable', 'string', 'max:30'],
            'alamat' => ['nullable', 'string', 'max:1000'],
            'jam_buka' => ['required', 'date_format:H:i'],
            'jam_tutup' => [
                'required',
                'date_format:H:i',
                function (string $attribute, mixed $value, \Closure $fail) use ($request): void {
                    if ($value <= (string) $request->input('jam_buka')) {
                        $fail('Jam tutup harus setelah jam buka.');
                    }
                },
            ],
            'durasi_minimum' => ['required', 'integer', 'min:1', 'max:365'],
            'deposit' => ['required', 'numeric', 'min:0', 'max:1000000000'],
            'denda_per_hari' => ['required', 'numeric', 'min:0', 'max:1000000000'],
            'notifikasi_email' => ['required', 'boolean'],
            'notifikasi_whatsapp' => ['required', 'boolean'],
            'pengingat_pengembalian' => ['required', 'boolean'],
        ], [
            'nama_usaha.required' => 'Nama usaha wajib diisi.',
            'email.email' => 'Format email operasional tidak valid.',
            'jam_buka.required' => 'Jam buka wajib diisi.',
            'jam_buka.date_format' => 'Format jam buka tidak valid.',
            'jam_tutup.required' => 'Jam tutup wajib diisi.',
            'jam_tutup.date_format' => 'Format jam tutup tidak valid.',
            'durasi_minimum.required' => 'Durasi minimum wajib diisi.',
            'durasi_minimum.integer' => 'Durasi minimum harus berupa angka bulat.',
            'durasi_minimum.min' => 'Durasi minimum minimal 1 hari.',
            'deposit.required' => 'Deposit wajib diisi.',
            'deposit.numeric' => 'Deposit harus berupa angka.',
            'deposit.min' => 'Deposit tidak boleh negatif.',
            'denda_per_hari.required' => 'Denda per hari wajib diisi.',
            'denda_per_hari.numeric' => 'Denda per hari harus berupa angka.',
            'denda_per_hari.min' => 'Denda per hari tidak boleh negatif.',
        ]);

        Setting::current()->update($data);

        return redirect()
            ->route('admin.settings')
            ->with('success', 'Pengaturan workspace berhasil disimpan.');
    }

    public function updateProfile(Request $request)
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
            ->route('admin.settings')
            ->with('success', 'Profil admin berhasil diperbarui.');
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
            ->route('admin.settings')
            ->with('success', 'Password berhasil diperbarui.');
    }
}

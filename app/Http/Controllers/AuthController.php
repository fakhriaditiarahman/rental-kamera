<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->merge([
            'name' => trim((string) $request->input('name')),
            'address' => trim((string) $request->input('address')),
            'phone' => preg_replace('/[\s-]/', '', (string) $request->input('phone')),
        ]);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'regex:/^(?:\+62|62|0)8[1-9][0-9]{7,11}$/', 'max:20', 'unique:pelanggan,no_telepon'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'address' => ['required', 'string', 'max:1000'],
        ]);

        $user = User::create([
            'nama_pelanggan' => $data['name'],
            'no_telepon' => $data['phone'],
            'alamat' => $data['address'],
            'password_hash' => Hash::make($data['password']),
            'role' => 'customer',
        ]);
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('customer.dashboard');
    }

    public function login(Request $request)
    {
        $request->merge([
            'phone' => preg_replace('/[\s-]/', '', (string) $request->input('phone')),
        ]);

        $data = $request->validate([
            'phone' => ['required', 'string', 'max:30'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('no_telepon', $data['phone'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password_hash)) {
            return back()->withErrors(['phone' => 'Nomor telepon atau password tidak sesuai.']);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(
            $request->user()->role === 'admin' ? route('admin.dashboard') : route('customer.dashboard')
        );
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CameraController extends Controller
{
    public function index()
    {
        return Inertia::render('App', [
            'title' => 'Katalog Kamera',
            'cameras' => Camera::query()->where('status_ketersediaan', '!=', 'Tidak tersedia')->orderBy('nama_produk')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'max:100'],
            'rate' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:Tersedia,Terbatas,Disewa,Tidak tersedia'],
        ], [
            'name.required' => 'Nama kamera wajib diisi.',
            'type.required' => 'Jenis kamera wajib diisi.',
            'rate.required' => 'Harga sewa wajib diisi.',
            'rate.numeric' => 'Harga sewa harus berupa angka.',
            'stock.required' => 'Stok wajib diisi.',
            'stock.integer' => 'Stok harus berupa angka bulat.',
            'status.required' => 'Status ketersediaan wajib dipilih.',
            'status.in' => 'Status ketersediaan tidak valid.',
        ]);

        Camera::query()->create([
            'nama_produk' => $data['name'],
            'jenis_kamera' => $data['type'],
            'harga_sewa' => $data['rate'],
            'stok' => $data['stock'],
            'status_ketersediaan' => $data['status'],
        ]);

        return back()->with('success', 'Kamera berhasil ditambahkan.');
    }
}

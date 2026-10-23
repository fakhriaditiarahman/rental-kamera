<?php

namespace App\Http\Controllers;

use App\Models\Camera;
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
}

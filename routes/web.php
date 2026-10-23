<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CameraController;
use App\Http\Controllers\RentalController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('App', [
        'title' => 'Beranda',
    ]);
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('App', ['title' => 'Masuk', 'authPage' => 'login']))->name('login');
    Route::get('/register', fn () => Inertia::render('App', ['title' => 'Daftar', 'authPage' => 'register']))->name('register');
});

Route::get('/katalog', [CameraController::class, 'index'])->name('catalog');
Route::post('/register', [AuthController::class, 'register'])->name('register.store');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login.store');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/sewa', [RentalController::class, 'store'])->name('rentals.store');
    Route::patch('/sewa/{rental}/status', [RentalController::class, 'updateStatus'])
        ->middleware('role:admin')->name('rentals.status');
});

Route::get('/admin/{path?}', function () {
    return Inertia::render('App', [
        'title' => 'Dashboard Admin',
    ]);
})->middleware(['auth', 'role:admin'])->where('path', '.*')->name('admin.dashboard');

Route::get('/pelanggan/{path?}', function () {
    $user = request()->user();

    return Inertia::render('App', [
        'title' => 'Dashboard Pelanggan',
        'customer' => [
            'id' => $user->id_pelanggan,
            'name' => $user->name,
            'phone' => $user->phone,
            'address' => $user->address,
        ],
        'rentals' => $user->rentals()->with('camera')->latest()->get()->map(fn ($rental) => [
            'id' => $rental->transaction_code,
            'product' => $rental->camera->name,
            'dates' => $rental->start_date->translatedFormat('d M Y').' — '.$rental->end_date->translatedFormat('d M Y'),
            'total' => (float) $rental->total_amount,
            'status' => match ($rental->status_sewa) {
                'menunggu_persetujuan' => 'Menunggu persetujuan',
                'disetujui' => 'Disetujui',
                'sedang_disewa' => 'Sedang disewa',
                'selesai' => 'Selesai',
                'ditolak' => 'Ditolak',
                default => 'Dibatalkan',
            },
            'tone' => 'sand',
        ]),
    ]);
})->middleware(['auth', 'role:customer'])->where('path', '.*')->name('customer.dashboard');

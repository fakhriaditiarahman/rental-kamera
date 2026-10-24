<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CameraController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerProfileController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\SettingController;
use App\Models\Camera;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('App', [
        'title' => 'Beranda',
        'cameras' => Camera::adminList(),
    ]);
})->name('home');

Route::get('/admin/login', function () {
    if (request()->user()?->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    return Inertia::render('App', [
        'title' => 'Masuk Admin',
        'authPage' => 'admin-login',
    ]);
})->name('admin.login');

Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('App', ['title' => 'Masuk', 'authPage' => 'login']))->name('login');
    Route::get('/register', fn () => Inertia::render('App', ['title' => 'Daftar', 'authPage' => 'register']))->name('register');
});

Route::get('/katalog', [CameraController::class, 'index'])->name('catalog');
Route::get('/ketersediaan', [CameraController::class, 'availability'])->name('catalog.availability');
Route::get('/ketersediaan/hasil', [CameraController::class, 'availabilityPage'])->name('catalog.availability.results');
Route::post('/register', [AuthController::class, 'register'])->name('register.store');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login.store');
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->middleware('throttle:10,1')->name('admin.login.store');

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/sewa', [RentalController::class, 'store'])->name('rentals.store');
    Route::patch('/sewa/{rental}/status', [RentalController::class, 'updateStatus'])
        ->middleware('role:admin')->name('rentals.status');
    Route::post('/admin/kamera', [CameraController::class, 'store'])
        ->middleware('role:admin')->name('admin.cameras.store');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/admin/insight', [InsightController::class, 'show'])->name('admin.insight');
    Route::get('/admin/pelanggan', [CustomerController::class, 'index'])->name('admin.customers');
    Route::get('/admin/inventaris', [InventoryController::class, 'index'])->name('admin.inventory');
    Route::patch('/admin/inventaris/{camera}', [InventoryController::class, 'update'])->name('admin.inventory.update');
    Route::get('/admin/pengaturan', [SettingController::class, 'index'])->name('admin.settings');
    Route::patch('/admin/pengaturan', [SettingController::class, 'update'])->name('admin.settings.update');
    Route::patch('/admin/pengaturan/profil', [SettingController::class, 'updateProfile'])->name('admin.settings.profile');
    Route::put('/admin/pengaturan/password', [SettingController::class, 'updatePassword'])->name('admin.settings.password');
});

Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('/pelanggan/profil', [CustomerProfileController::class, 'index'])->name('customer.profile');
    Route::patch('/pelanggan/profil', [CustomerProfileController::class, 'update'])->name('customer.profile.update');
    Route::put('/pelanggan/profil/password', [CustomerProfileController::class, 'updatePassword'])->name('customer.profile.password');
});

Route::get('/admin/{path?}', function () {
    return Inertia::render('App', [
        'title' => 'Dashboard Admin',
        'cameras' => Camera::adminList(),
    ]);
})->middleware(['auth', 'role:admin'])->where('path', '.*')->name('admin.dashboard');

Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('/pelanggan/sewa', [CustomerController::class, 'rentals'])->name('customer.rentals');
    Route::get('/pelanggan/{path?}', [CustomerController::class, 'dashboard'])
        ->where('path', '.*')
        ->name('customer.dashboard');
});

<?php

namespace Database\Seeders;

use App\Models\Camera;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'nama_pelanggan' => 'Admin Sewa Kamera',
            'no_telepon' => '081234567890',
            'alamat' => 'Kantor Sewa Kamera',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'nama_pelanggan' => 'Nadia Putri',
            'no_telepon' => '081298765432',
            'alamat' => 'Jl. Melati No. 10',
        ]);

        foreach ([
            ['nama_produk' => 'Sony α7 IV', 'jenis_kamera' => 'Mirrorless', 'harga_sewa' => 275000, 'stok' => 3],
            ['nama_produk' => 'Canon EOS R6 Mark II', 'jenis_kamera' => 'Mirrorless', 'harga_sewa' => 300000, 'stok' => 2],
            ['nama_produk' => 'Fujifilm X-T5', 'jenis_kamera' => 'Mirrorless', 'harga_sewa' => 225000, 'stok' => 1],
            ['nama_produk' => 'Sony FX3', 'jenis_kamera' => 'Cinema Camera', 'harga_sewa' => 450000, 'stok' => 1],
        ] as $camera) {
            Camera::query()->create($camera);
        }
    }
}

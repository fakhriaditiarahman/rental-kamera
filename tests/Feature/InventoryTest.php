<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_the_inventory_page_with_contract_props(): void
    {
        $camera = $this->camera('Canon EOS R6 Mark II', 3, 300000);
        $this->camera('Nikon Z6 II', 1, 250000, 'Disewa');
        $customer = User::factory()->create([
            'nama_pelanggan' => 'Nadia Putri',
            'no_telepon' => '081298765432',
        ]);

        // Unit yang sedang keluar hari ini.
        $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->subDay()->toDateString(),
            'tanggal_kembali' => now()->addDay()->toDateString(),
            'status_sewa' => 'sedang_disewa',
        ]);
        // Transaksi selesai dan transaksi mendatang tidak dihitung sebagai unit keluar.
        $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->subDays(4)->toDateString(),
            'tanggal_kembali' => now()->subDays(2)->toDateString(),
            'status_sewa' => 'selesai',
        ]);
        $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->addDays(3)->toDateString(),
            'tanggal_kembali' => now()->addDays(4)->toDateString(),
            'status_sewa' => 'disetujui',
        ]);

        $this->actingAs($this->admin())
            ->get('/admin/inventaris')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->where('title', 'Inventaris')
                ->has('inventory', 2)
                ->where('inventory.0.name', 'Canon EOS R6 Mark II')
                ->where('inventory.0.type', 'Mirrorless')
                ->where('inventory.0.rate', 300000)
                ->where('inventory.0.stock', 3)
                ->where('inventory.0.status', 'Tersedia')
                ->where('inventory.0.rentedUnits', 1)
                ->where('inventory.0.availableUnits', 2)
                ->where('inventory.0.utilization', 33)
                ->has('inventory.0.ongoingRentals', 1)
                ->where('inventory.0.ongoingRentals.0.customer', 'Nadia Putri')
                ->where('inventory.0.ongoingRentals.0.status', 'Sedang disewa')
                ->where('inventory.1.name', 'Nikon Z6 II')
                ->where('inventory.1.rentedUnits', 0)
                ->where('inventory.1.availableUnits', 1)
                ->where('inventorySummary.total_products', 2)
                ->where('inventorySummary.total_units', 4)
                ->where('inventorySummary.rented_units', 1)
                ->where('inventorySummary.available_units', 3)
                ->where('inventorySummary.attention_products', 0)
                ->where('inventorySummary.daily_value', 1150000)
            );
    }

    public function test_admin_can_update_stock_and_availability_status(): void
    {
        $camera = $this->camera('Canon EOS R6 Mark II', 2, 300000);

        $this->actingAs($this->admin())
            ->patch('/admin/inventaris/'.$camera->id_produk, [
                'stock' => 5,
                'status' => 'Terbatas',
            ])
            ->assertRedirect('/admin/inventaris')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('produk', [
            'id_produk' => $camera->id_produk,
            'stok' => 5,
            'status_ketersediaan' => 'Terbatas',
        ]);
    }

    public function test_stock_cannot_drop_below_the_number_of_units_currently_rented(): void
    {
        $camera = $this->camera('Canon EOS R6 Mark II', 3, 300000);
        $customer = User::factory()->create();

        $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->toDateString(),
            'tanggal_kembali' => now()->addDays(2)->toDateString(),
            'status_sewa' => 'sedang_disewa',
        ]);

        $this->actingAs($this->admin())
            ->patch('/admin/inventaris/'.$camera->id_produk, [
                'stock' => 0,
                'status' => 'Tersedia',
            ])
            ->assertSessionHasErrors('stock');

        $this->assertDatabaseHas('produk', [
            'id_produk' => $camera->id_produk,
            'stok' => 3,
        ]);
    }

    public function test_inventory_validation_rejects_invalid_status_and_stock(): void
    {
        $camera = $this->camera('Canon EOS R6 Mark II', 2, 300000);

        $this->actingAs($this->admin())
            ->patch('/admin/inventaris/'.$camera->id_produk, [
                'stock' => -1,
                'status' => 'Rusak',
            ])
            ->assertSessionHasErrors(['stock', 'status']);
    }

    public function test_inventory_page_is_only_available_to_administrators(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->get('/admin/inventaris')
            ->assertForbidden();
    }

    public function test_guests_are_redirected_to_admin_login_from_the_inventory_page(): void
    {
        $this->get('/admin/inventaris')->assertRedirect('/admin/login');
    }

    private function admin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'no_telepon' => '081234567890',
            'password_hash' => Hash::make('rahasia123'),
        ]);
    }

    private function camera(string $name, int $stock, int $rate, string $status = 'Tersedia'): Camera
    {
        return Camera::query()->create([
            'nama_produk' => $name,
            'jenis_kamera' => 'Mirrorless',
            'harga_sewa' => $rate,
            'stok' => $stock,
            'status_ketersediaan' => $status,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function rental(User $customer, Camera $camera, array $overrides = []): Rental
    {
        return Rental::query()->create([
            'kode_transaksi' => 'SK-TEST-'.$customer->id_pelanggan.'-'.fake()->unique()->numerify('####'),
            'id_pelanggan' => $customer->id_pelanggan,
            'id_produk' => $camera->id_produk,
            'tanggal_sewa' => now()->toDateString(),
            'tanggal_kembali' => now()->addDay()->toDateString(),
            'durasi_sewa' => 2,
            'harga_sewa_saat_transaksi' => 300000,
            'total_biaya' => 600000,
            'status_sewa' => 'menunggu_persetujuan',
            ...$overrides,
        ]);
    }
}

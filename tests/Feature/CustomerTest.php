<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_the_customer_page_with_contract_props(): void
    {
        $camera = $this->camera();
        $nadia = User::factory()->create([
            'nama_pelanggan' => 'Nadia Putri',
            'no_telepon' => '081298765432',
            'alamat' => 'Jl. Melati No. 10',
        ]);
        User::factory()->create([
            'nama_pelanggan' => 'Raka Pratama',
            'no_telepon' => '081377788899',
        ]);

        $this->rental($nadia, $camera, [
            'tanggal_sewa' => now()->subDays(3)->toDateString(),
            'tanggal_kembali' => now()->subDay()->toDateString(),
            'status_sewa' => 'selesai',
            'total_biaya' => 550000,
        ]);
        $this->rental($nadia, $camera, [
            'tanggal_sewa' => now()->toDateString(),
            'tanggal_kembali' => now()->addDays(2)->toDateString(),
            'status_sewa' => 'sedang_disewa',
            'total_biaya' => 825000,
        ]);

        $this->actingAs($this->admin())
            ->get('/admin/pelanggan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->where('title', 'Pelanggan')
                ->has('customers', 2)
                ->where('customers.0.name', 'Nadia Putri')
                ->where('customers.0.phone', '081298765432')
                ->where('customers.0.address', 'Jl. Melati No. 10')
                ->where('customers.0.rentalCount', 2)
                ->where('customers.0.activeRentalCount', 1)
                ->where('customers.0.completedRentalCount', 1)
                ->where('customers.0.totalSpent', 550000)
                ->where('customers.0.status', 'Sedang menyewa')
                ->has('customers.0.rentals', 2)
                ->where('customers.0.rentals.0.status', 'Sedang disewa')
                ->where('customers.0.rentals.1.status', 'Selesai')
                ->where('customers.1.name', 'Raka Pratama')
                ->where('customers.1.status', 'Belum pernah menyewa')
                ->where('customers.1.lastRentalAt', null)
                ->where('customerSummary.total', 2)
                ->where('customerSummary.active', 1)
                ->where('customerSummary.new_this_month', 2)
                ->where('customerSummary.completed_revenue', 550000)
            );
    }

    public function test_customer_list_excludes_administrator_accounts(): void
    {
        User::factory()->create(['role' => 'admin', 'nama_pelanggan' => 'Admin Sewa Kamera']);
        User::factory()->create(['role' => 'customer', 'nama_pelanggan' => 'Nadia Putri']);

        $this->actingAs($this->admin())
            ->get('/admin/pelanggan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('customers', 1)
                ->where('customers.0.name', 'Nadia Putri')
                ->where('customerSummary.total', 1)
            );
    }

    public function test_customer_page_is_only_available_to_administrators(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->get('/admin/pelanggan')
            ->assertForbidden();
    }

    public function test_guests_are_redirected_to_admin_login_from_the_customer_page(): void
    {
        $this->get('/admin/pelanggan')->assertRedirect('/admin/login');
    }

    public function test_customer_can_open_my_rentals_page_with_contract_props(): void
    {
        $camera = $this->camera();
        $customer = User::factory()->create([
            'nama_pelanggan' => 'Nadia Putri',
            'no_telepon' => '081298765432',
            'alamat' => 'Jl. Melati No. 10',
        ]);
        $other = User::factory()->create(['nama_pelanggan' => 'Raka Pratama']);

        $this->rental($other, $camera, ['status_sewa' => 'menunggu_persetujuan']);

        $pending = $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->addDays(7)->toDateString(),
            'tanggal_kembali' => now()->addDays(8)->toDateString(),
            'durasi_sewa' => 2,
            'total_biaya' => 550000,
            'status_sewa' => 'menunggu_persetujuan',
        ]);
        $active = $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->toDateString(),
            'tanggal_kembali' => now()->addDays(3)->toDateString(),
            'durasi_sewa' => 4,
            'total_biaya' => 1100000,
            'status_sewa' => 'sedang_disewa',
            'picked_up_at' => now(),
        ]);
        $completed = $this->rental($customer, $camera, [
            'tanggal_sewa' => now()->subDays(10)->toDateString(),
            'tanggal_kembali' => now()->subDays(8)->toDateString(),
            'durasi_sewa' => 3,
            'total_biaya' => 825000,
            'status_sewa' => 'selesai',
            'returned_at' => now()->subDays(8),
        ]);

        $this->actingAs($customer)
            ->get('/pelanggan/sewa')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->where('title', 'Sewa saya')
                ->has('rentals', 3)
                ->where('customer.id', $customer->id_pelanggan)
                ->where('customer.name', 'Nadia Putri')
                ->where('customer.phone', '081298765432')
                ->where('rentals.0.id', $pending->kode_transaksi)
                ->where('rentals.0.status', 'Menunggu persetujuan')
                ->where('rentals.0.statusCode', 'menunggu_persetujuan')
                ->where('rentals.1.id', $active->kode_transaksi)
                ->where('rentals.1.product', 'Sony α7 IV')
                ->where('rentals.1.duration', 4)
                ->where('rentals.1.rate', 275000)
                ->where('rentals.1.total', 1100000)
                ->where('rentals.1.status', 'Sedang disewa')
                ->where('rentals.2.id', $completed->kode_transaksi)
                ->where('rentals.2.status', 'Selesai')
                ->where('customerRentalSummary.total', 3)
                ->where('customerRentalSummary.active', 2)
                ->where('customerRentalSummary.pending', 1)
                ->where('customerRentalSummary.completed', 1)
                ->where('customerRentalSummary.total_spent', 825000)
                ->where('customerRentalSummary.next_return_at', now()->addDays(3)->translatedFormat('d M Y'))
                ->has('cameras', 1)
            );
    }

    public function test_my_rentals_page_is_not_available_to_administrators(): void
    {
        $this->actingAs($this->admin())->get('/pelanggan/sewa')->assertForbidden();
    }

    public function test_guests_are_redirected_to_login_from_my_rentals_page(): void
    {
        $this->get('/pelanggan/sewa')->assertRedirect('/login');
    }

    public function test_customer_without_rentals_receives_an_empty_contract(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/pelanggan/sewa')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('rentals', 0)
                ->where('customerRentalSummary.total', 0)
                ->where('customerRentalSummary.active', 0)
                ->where('customerRentalSummary.total_spent', 0)
                ->where('customerRentalSummary.next_return_at', null)
            );
    }

    private function admin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'no_telepon' => '081234567890',
            'password_hash' => Hash::make('rahasia123'),
        ]);
    }

    private function camera(): Camera
    {
        return Camera::query()->create([
            'nama_produk' => 'Sony α7 IV',
            'jenis_kamera' => 'Mirrorless',
            'harga_sewa' => 275000,
            'stok' => 3,
            'status_ketersediaan' => 'Tersedia',
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
            'harga_sewa_saat_transaksi' => 275000,
            'total_biaya' => 550000,
            'status_sewa' => 'menunggu_persetujuan',
            ...$overrides,
        ]);
    }
}

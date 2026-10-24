<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomerProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_open_the_profile_page_with_contract_props(): void
    {
        $customer = $this->customer();
        $camera = $this->camera();

        $this->rental($customer, $camera, 'SK-TEST-001', 675000, 'selesai');
        $this->rental($customer, $camera, 'SK-TEST-002', 1100000, 'menunggu_persetujuan');

        $this->actingAs($customer)
            ->get('/pelanggan/profil')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->where('profile.name', 'Nadia Putri')
                ->where('profile.phone', '081298765432')
                ->where('profile.address', 'Jl. Melati No. 10')
                ->where('profile.role', 'Pelanggan')
                ->where('profileSummary.rental_count', 2)
                ->where('profileSummary.active_rental_count', 1)
                ->where('profileSummary.completed_rental_count', 1)
                ->where('profileSummary.total_spent', 675000)
                ->where('profileSummary.last_rental_at', '24 Oct 2026')
                ->where('profileSummary.favorite_camera', 'Sony α7 IV')
                ->has('rentals', 2)
                ->where('rentals.0.id', 'SK-TEST-002')
                ->where('rentals.0.status', 'Menunggu persetujuan')
                ->where('auth.user.role', 'customer')
            );
    }

    public function test_customer_can_update_their_own_profile(): void
    {
        $customer = $this->customer();

        $this->actingAs($customer)
            ->patch('/pelanggan/profil', [
                'name' => 'Nadia Putri Rahma',
                'phone' => '0812-9876-5432',
                'address' => 'Jl. Melati No. 12',
            ])
            ->assertRedirect('/pelanggan/profil')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('pelanggan', [
            'id_pelanggan' => $customer->id_pelanggan,
            'nama_pelanggan' => 'Nadia Putri Rahma',
            'no_telepon' => '081298765432',
            'alamat' => 'Jl. Melati No. 12',
        ]);
    }

    public function test_profile_update_rejects_a_phone_number_owned_by_another_account(): void
    {
        $customer = $this->customer();
        User::factory()->create(['no_telepon' => '081211112222']);

        $this->actingAs($customer)
            ->patch('/pelanggan/profil', [
                'name' => 'Nadia Putri',
                'phone' => '081211112222',
                'address' => 'Jl. Melati No. 10',
            ])
            ->assertSessionHasErrors(['phone']);
    }

    public function test_profile_update_rejects_an_invalid_phone_number(): void
    {
        $this->actingAs($this->customer())
            ->patch('/pelanggan/profil', [
                'name' => 'Nadia Putri',
                'phone' => '12345',
                'address' => 'Jl. Melati No. 10',
            ])
            ->assertSessionHasErrors(['phone']);
    }

    public function test_customer_can_change_password_with_the_current_password(): void
    {
        $customer = $this->customer();

        $this->actingAs($customer)
            ->put('/pelanggan/profil/password', [
                'current_password' => 'rahasia123',
                'password' => 'password-baru-123',
                'password_confirmation' => 'password-baru-123',
            ])
            ->assertRedirect('/pelanggan/profil')
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('password-baru-123', $customer->fresh()->password_hash));
    }

    public function test_password_change_rejects_the_wrong_current_password(): void
    {
        $customer = $this->customer();

        $this->actingAs($customer)
            ->put('/pelanggan/profil/password', [
                'current_password' => 'password-salah',
                'password' => 'password-baru-123',
                'password_confirmation' => 'password-baru-123',
            ])
            ->assertSessionHasErrors(['current_password']);

        $this->assertTrue(Hash::check('rahasia123', $customer->fresh()->password_hash));
    }

    public function test_admins_cannot_access_the_customer_profile_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/pelanggan/profil')->assertForbidden();
        $this->actingAs($admin)->patch('/pelanggan/profil', [
            'name' => 'Admin',
            'phone' => '081234567890',
            'address' => 'Kantor',
        ])->assertForbidden();
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get('/pelanggan/profil')->assertRedirect('/login');
    }

    private function customer(): User
    {
        return User::factory()->create([
            'role' => 'customer',
            'nama_pelanggan' => 'Nadia Putri',
            'no_telepon' => '081298765432',
            'alamat' => 'Jl. Melati No. 10',
            'password_hash' => Hash::make('rahasia123'),
        ]);
    }

    private function camera(): Camera
    {
        return Camera::create([
            'nama_produk' => 'Sony α7 IV',
            'jenis_kamera' => 'Mirrorless',
            'harga_sewa' => 275000,
            'stok' => 3,
            'status_ketersediaan' => 'Tersedia',
        ]);
    }

    private function rental(User $customer, Camera $camera, string $code, float $total, string $status): Rental
    {
        return Rental::create([
            'kode_transaksi' => $code,
            'id_pelanggan' => $customer->id_pelanggan,
            'id_produk' => $camera->id_produk,
            'tanggal_sewa' => '2026-10-24',
            'tanggal_kembali' => '2026-10-27',
            'durasi_sewa' => 4,
            'harga_sewa_saat_transaksi' => 275000,
            'total_biaya' => $total,
            'status_sewa' => $status,
        ]);
    }
}

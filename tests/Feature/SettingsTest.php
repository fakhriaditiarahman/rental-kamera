<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_the_settings_page_with_contract_props(): void
    {
        $this->actingAs($this->admin())
            ->get('/admin/pengaturan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->where('settings.nama_usaha', 'Kamera Kita')
                ->where('settings.jam_buka', '09:00')
                ->where('settings.jam_tutup', '20:00')
                ->where('settings.durasi_minimum', 1)
                ->where('settings.notifikasi_email', true)
                ->where('auth.user.role', 'admin')
            );
    }

    public function test_admin_can_update_workspace_settings(): void
    {
        $this->actingAs($this->admin())
            ->patch('/admin/pengaturan', $this->settingsPayload([
                'nama_usaha' => 'Kamera Kita Studio',
                'email' => 'halo@kamerakita.id',
                'jam_buka' => '08:30',
                'jam_tutup' => '21:00',
                'durasi_minimum' => 2,
                'deposit' => 250000,
                'denda_per_hari' => 50000,
                'notifikasi_whatsapp' => true,
            ]))
            ->assertRedirect('/admin/pengaturan')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('pengaturan', [
            'nama_usaha' => 'Kamera Kita Studio',
            'email' => 'halo@kamerakita.id',
            'jam_buka' => '08:30',
            'jam_tutup' => '21:00',
            'durasi_minimum' => 2,
            'deposit' => 250000,
            'denda_per_hari' => 50000,
            'notifikasi_whatsapp' => true,
        ]);
    }

    public function test_settings_validation_rejects_invalid_business_hours(): void
    {
        $this->actingAs($this->admin())
            ->patch('/admin/pengaturan', $this->settingsPayload([
                'jam_buka' => '21:00',
                'jam_tutup' => '08:00',
                'durasi_minimum' => 0,
            ]))
            ->assertSessionHasErrors(['jam_tutup', 'durasi_minimum']);

        $this->assertDatabaseMissing('pengaturan', [
            'jam_buka' => '21:00',
        ]);
    }

    public function test_admin_can_update_their_own_profile(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->patch('/admin/pengaturan/profil', [
                'name' => 'Ardi Rahman',
                'phone' => '0812-3456-7890',
                'address' => 'Jl. Baru No. 5',
            ])
            ->assertRedirect('/admin/pengaturan')
            ->assertSessionHas('success');

        $this->assertDatabaseHas('pelanggan', [
            'id_pelanggan' => $admin->id_pelanggan,
            'nama_pelanggan' => 'Ardi Rahman',
            'no_telepon' => '081234567890',
            'alamat' => 'Jl. Baru No. 5',
        ]);
    }

    public function test_profile_update_rejects_a_phone_number_owned_by_another_account(): void
    {
        User::factory()->create(['no_telepon' => '081298765432']);

        $this->actingAs($this->admin())
            ->patch('/admin/pengaturan/profil', [
                'name' => 'Ardi Rahman',
                'phone' => '081298765432',
                'address' => 'Jl. Baru No. 5',
            ])
            ->assertSessionHasErrors(['phone']);
    }

    public function test_admin_can_change_password_with_the_current_password(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put('/admin/pengaturan/password', [
                'current_password' => 'rahasia123',
                'password' => 'password-baru-123',
                'password_confirmation' => 'password-baru-123',
            ])
            ->assertRedirect('/admin/pengaturan')
            ->assertSessionHas('success');

        $this->assertTrue(Hash::check('password-baru-123', $admin->fresh()->password_hash));
    }

    public function test_password_change_rejects_the_wrong_current_password(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put('/admin/pengaturan/password', [
                'current_password' => 'password-salah',
                'password' => 'password-baru-123',
                'password_confirmation' => 'password-baru-123',
            ])
            ->assertSessionHasErrors(['current_password']);

        $this->assertTrue(Hash::check('rahasia123', $admin->fresh()->password_hash));
    }

    public function test_customers_cannot_access_settings_routes(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)->get('/admin/pengaturan')->assertForbidden();
        $this->actingAs($customer)->patch('/admin/pengaturan', $this->settingsPayload())->assertForbidden();
        $this->actingAs($customer)->patch('/admin/pengaturan/profil', [
            'name' => 'Nadia Putri',
            'phone' => '081298765432',
            'address' => 'Jl. Melati No. 10',
        ])->assertForbidden();
    }

    public function test_guests_are_redirected_to_admin_login(): void
    {
        $this->get('/admin/pengaturan')->assertRedirect('/admin/login');
    }

    private function admin(): User
    {
        return User::factory()->create([
            'role' => 'admin',
            'no_telepon' => '081234567890',
            'password_hash' => Hash::make('rahasia123'),
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function settingsPayload(array $overrides = []): array
    {
        return [
            'nama_usaha' => 'Kamera Kita',
            'email' => null,
            'no_telepon' => '081234567890',
            'alamat' => 'Jl. Contoh No. 1',
            'jam_buka' => '09:00',
            'jam_tutup' => '20:00',
            'durasi_minimum' => 1,
            'deposit' => 0,
            'denda_per_hari' => 0,
            'notifikasi_email' => true,
            'notifikasi_whatsapp' => false,
            'pengingat_pengembalian' => true,
            ...$overrides,
        ];
    }
}

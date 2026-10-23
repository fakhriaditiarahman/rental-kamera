<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_with_phone_and_address(): void
    {
        $response = $this->post('/register', [
            'name' => 'Nadia Putri',
            'phone' => '081234567890',
            'address' => 'Jl. Melati No. 10',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $response->assertRedirect('/pelanggan');
        $this->assertAuthenticated();
        $this->assertDatabaseHas('pelanggan', [
            'no_telepon' => '081234567890',
            'role' => 'customer',
            'alamat' => 'Jl. Melati No. 10',
        ]);
        $this->assertTrue(Hash::check('rahasia123', User::query()->firstOrFail()->password_hash));
    }

    public function test_duplicate_phone_and_invalid_registration_are_rejected(): void
    {
        User::factory()->create(['no_telepon' => '081234567890']);

        $this->post('/register', [
            'name' => 'Nadia Putri',
            'phone' => '081234567890',
            'address' => '',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertSessionHasErrors(['phone', 'address', 'password']);
    }

    public function test_customer_can_login_and_logout_with_phone(): void
    {
        $user = User::factory()->create([
            'no_telepon' => '081234567890',
            'password_hash' => Hash::make('rahasia123'),
            'role' => 'customer',
        ]);

        $this->post('/login', [
            'phone' => '081234567890',
            'password' => 'rahasia123',
        ])->assertRedirect('/pelanggan');

        $this->assertAuthenticatedAs($user);
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_invalid_login_is_generic_and_protected_route_requires_authentication(): void
    {
        $this->get('/pelanggan')->assertRedirect('/login');

        $this->post('/login', [
            'phone' => '089999999999',
            'password' => 'wrong-password',
        ])->assertSessionHasErrors(['phone' => 'Nomor telepon atau password tidak sesuai.']);
        $this->assertGuest();
    }

    public function test_customer_cannot_access_admin_route(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->get('/admin')
            ->assertForbidden();
    }

    public function test_admin_login_page_is_available_for_guests(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_admin_can_login_through_admin_login_page(): void
    {
        $admin = User::factory()->create([
            'no_telepon' => '081234567890',
            'password_hash' => Hash::make('rahasia123'),
            'role' => 'admin',
        ]);

        $this->post('/admin/login', [
            'phone' => '081234567890',
            'password' => 'rahasia123',
        ])->assertRedirect('/admin');

        $this->assertAuthenticatedAs($admin);
    }

    public function test_admin_always_lands_on_admin_dashboard_regardless_of_intended_url(): void
    {
        User::factory()->create([
            'no_telepon' => '081234567890',
            'password_hash' => Hash::make('rahasia123'),
            'role' => 'admin',
        ]);

        $this->withSession(['url.intended' => '/admin/katalog'])
            ->post('/admin/login', [
                'phone' => '081234567890',
                'password' => 'rahasia123',
            ])
            ->assertRedirect('/admin');
    }

    public function test_customer_cannot_login_through_admin_login_page(): void
    {
        User::factory()->create([
            'no_telepon' => '081298765432',
            'password_hash' => Hash::make('rahasia123'),
            'role' => 'customer',
        ]);

        $this->post('/admin/login', [
            'phone' => '081298765432',
            'password' => 'rahasia123',
        ])->assertSessionHasErrors('phone');

        $this->assertGuest();
    }

    public function test_guest_is_redirected_to_admin_login_when_opening_admin_area(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->get('/admin/katalog')->assertRedirect('/admin/login');
    }

    public function test_authenticated_customer_can_open_admin_login_page_to_switch_account(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->get('/admin/login')
            ->assertOk();
    }

    public function test_authenticated_admin_is_redirected_to_dashboard_from_admin_login_page(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->get('/admin/login')
            ->assertRedirect('/admin');
    }
}

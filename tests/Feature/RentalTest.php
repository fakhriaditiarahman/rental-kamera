<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RentalTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_submit_a_rental_with_inclusive_dates(): void
    {
        $camera = $this->camera(2, 275000);
        $customer = User::factory()->create();

        $start = now()->addDay();
        $end = now()->addDays(3);

        $this->actingAs($customer)
            ->post('/sewa', [
                'camera_id' => $camera->id_produk,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Pengajuan sewa berhasil dibuat.');

        $this->assertDatabaseHas('transaksi', [
            'id_pelanggan' => $customer->id_pelanggan,
            'id_produk' => $camera->id_produk,
            'durasi_sewa' => 3,
            'total_biaya' => 825000,
            'status_sewa' => 'menunggu_persetujuan',
        ]);
    }

    public function test_rental_is_rejected_when_all_units_are_booked_for_the_period(): void
    {
        $camera = $this->camera(1, 275000);
        $customer = User::factory()->create();

        Rental::query()->create([
            'kode_transaksi' => 'SK-TEST-0001',
            'id_pelanggan' => $customer->id_pelanggan,
            'id_produk' => $camera->id_produk,
            'tanggal_sewa' => now()->addDay()->toDateString(),
            'tanggal_kembali' => now()->addDays(3)->toDateString(),
            'durasi_sewa' => 3,
            'harga_sewa_saat_transaksi' => 275000,
            'total_biaya' => 825000,
            'status_sewa' => 'disetujui',
        ]);

        $this->actingAs($customer)
            ->post('/sewa', [
                'camera_id' => $camera->id_produk,
                'start_date' => now()->addDays(2)->toDateString(),
                'end_date' => now()->addDays(4)->toDateString(),
            ])
            ->assertSessionHasErrors('start_date');

        $this->assertDatabaseCount('transaksi', 1);
    }

    public function test_guests_are_redirected_to_login_before_renting(): void
    {
        $camera = $this->camera(1, 275000);

        $this->post('/sewa', [
            'camera_id' => $camera->id_produk,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
        ])->assertRedirect('/login');

        $this->assertDatabaseCount('transaksi', 0);
    }

    public function test_customer_catalog_receives_cameras_from_the_inventory(): void
    {
        $camera = $this->camera(2, 275000);
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/pelanggan/katalog')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->has('cameras', 1)
                ->where('cameras.0.id', $camera->id_produk)
                ->where('cameras.0.name', 'Sony α7 IV')
                ->where('cameras.0.rate', 275000)
                ->where('cameras.0.status', 'Tersedia'));
    }

    private function camera(int $stock, int $rate): Camera
    {
        return Camera::query()->create([
            'nama_produk' => 'Sony α7 IV',
            'jenis_kamera' => 'Mirrorless',
            'harga_sewa' => $rate,
            'stok' => $stock,
            'status_ketersediaan' => 'Tersedia',
        ]);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Camera;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CameraAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_check_which_cameras_are_available_for_a_period(): void
    {
        $camera = $this->camera(stock: 2);

        $this->getJson('/ketersediaan?tanggal_mulai='.now()->addDay()->toDateString().'&tanggal_kembali='.now()->addDays(3)->toDateString())
            ->assertOk()
            ->assertJsonPath('duration', 3)
            ->assertJsonPath('cameras.0.id', $camera->id_produk)
            ->assertJsonPath('cameras.0.status', 'Tersedia')
            ->assertJsonPath('cameras.0.available', true)
            ->assertJsonPath('cameras.0.availableStock', 2)
            ->assertJsonPath('cameras.0.bookedStock', 0);
    }

    public function test_overlapping_rentals_reduce_the_available_stock(): void
    {
        $camera = $this->camera(stock: 2);
        $customer = User::factory()->create();

        $this->rental($camera, $customer, now()->addDays(2), now()->addDays(4), 'disetujui');
        $this->rental($camera, $customer, now()->addDays(10), now()->addDays(11), 'disetujui');

        $this->getJson('/ketersediaan?tanggal_mulai='.now()->addDay()->toDateString().'&tanggal_kembali='.now()->addDays(3)->toDateString())
            ->assertOk()
            ->assertJsonPath('cameras.0.availableStock', 1)
            ->assertJsonPath('cameras.0.bookedStock', 1)
            ->assertJsonPath('cameras.0.status', 'Terbatas');
    }

    public function test_a_camera_with_all_units_booked_is_marked_unavailable(): void
    {
        $camera = $this->camera(stock: 1);
        $customer = User::factory()->create();

        $this->rental($camera, $customer, now()->addDay(), now()->addDays(3), 'menunggu_persetujuan');

        $this->getJson('/ketersediaan?tanggal_mulai='.now()->addDay()->toDateString().'&tanggal_kembali='.now()->addDays(2)->toDateString())
            ->assertOk()
            ->assertJsonPath('cameras.0.available', false)
            ->assertJsonPath('cameras.0.availableStock', 0)
            ->assertJsonPath('cameras.0.status', 'Tidak tersedia');
    }

    public function test_availability_results_page_returns_the_cameras_for_the_period(): void
    {
        $camera = $this->camera(stock: 2);

        $this->get('/ketersediaan/hasil?tanggal_mulai='.now()->addDay()->toDateString().'&tanggal_kembali='.now()->addDays(3)->toDateString())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('App', false)
                ->where('availability.startDate', now()->addDay()->toDateString())
                ->where('availability.endDate', now()->addDays(3)->toDateString())
                ->where('availability.duration', 3)
                ->has('availability.cameras', 1)
                ->where('availability.cameras.0.id', $camera->id_produk)
                ->where('availability.cameras.0.available', true)
                ->where('availability.cameras.0.availableStock', 2));
    }

    public function test_availability_results_page_redirects_home_when_the_dates_are_invalid(): void
    {
        $this->get('/ketersediaan/hasil?tanggal_mulai='.now()->addDays(3)->toDateString().'&tanggal_kembali='.now()->addDay()->toDateString())
            ->assertRedirect('/');
    }

    public function test_invalid_date_range_is_rejected(): void
    {
        $this->getJson('/ketersediaan?tanggal_mulai='.now()->addDays(3)->toDateString().'&tanggal_kembali='.now()->addDay()->toDateString())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('tanggal_kembali');
    }

    private function camera(int $stock): Camera
    {
        return Camera::query()->create([
            'nama_produk' => 'Sony α7 IV',
            'jenis_kamera' => 'Mirrorless',
            'harga_sewa' => 275000,
            'stok' => $stock,
            'status_ketersediaan' => 'Tersedia',
        ]);
    }

    private function rental(Camera $camera, User $customer, mixed $start, mixed $end, string $status): void
    {
        Rental::query()->create([
            'kode_transaksi' => 'SK-TEST-'.str()->random(6),
            'id_pelanggan' => $customer->id_pelanggan,
            'id_produk' => $camera->id_produk,
            'tanggal_sewa' => $start->toDateString(),
            'tanggal_kembali' => $end->toDateString(),
            'durasi_sewa' => 1,
            'harga_sewa_saat_transaksi' => 275000,
            'total_biaya' => 275000,
            'status_sewa' => $status,
        ]);
    }
}

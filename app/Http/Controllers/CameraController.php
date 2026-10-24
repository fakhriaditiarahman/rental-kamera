<?php

namespace App\Http\Controllers;

use App\Models\Camera;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CameraController extends Controller
{
    public function index()
    {
        return Inertia::render('App', [
            'title' => 'Katalog Kamera',
            'cameras' => Camera::query()->where('status_ketersediaan', '!=', 'Tidak tersedia')->orderBy('nama_produk')->get(),
        ]);
    }

    public function availability(Request $request)
    {
        return response()->json($this->availabilityPayload($request));
    }

    public function availabilityPage(Request $request)
    {
        try {
            $payload = $this->availabilityPayload($request);
        } catch (ValidationException) {
            return redirect()->route('home');
        }

        return Inertia::render('App', [
            'title' => 'Ketersediaan Kamera',
            'availability' => $payload,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function availabilityPayload(Request $request): array
    {
        $data = $request->validate([
            'tanggal_mulai' => ['required', 'date', 'after_or_equal:today'],
            'tanggal_kembali' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
        ], [
            'tanggal_mulai.required' => 'Tanggal mulai wajib diisi.',
            'tanggal_mulai.date' => 'Tanggal mulai tidak valid.',
            'tanggal_mulai.after_or_equal' => 'Tanggal mulai tidak boleh sebelum hari ini.',
            'tanggal_kembali.required' => 'Tanggal kembali wajib diisi.',
            'tanggal_kembali.date' => 'Tanggal kembali tidak valid.',
            'tanggal_kembali.after_or_equal' => 'Tanggal kembali tidak boleh sebelum tanggal mulai.',
        ]);

        $start = Carbon::parse($data['tanggal_mulai']);
        $end = Carbon::parse($data['tanggal_kembali']);

        return [
            'startDate' => $start->toDateString(),
            'endDate' => $end->toDateString(),
            'duration' => $start->diffInDays($end) + 1,
            'cameras' => Camera::availabilityList($start->toDateString(), $end->toDateString())->all(),
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'max:100'],
            'rate' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:Tersedia,Terbatas,Disewa,Tidak tersedia'],
        ], [
            'name.required' => 'Nama kamera wajib diisi.',
            'type.required' => 'Jenis kamera wajib diisi.',
            'rate.required' => 'Harga sewa wajib diisi.',
            'rate.numeric' => 'Harga sewa harus berupa angka.',
            'stock.required' => 'Stok wajib diisi.',
            'stock.integer' => 'Stok harus berupa angka bulat.',
            'status.required' => 'Status ketersediaan wajib dipilih.',
            'status.in' => 'Status ketersediaan tidak valid.',
        ]);

        Camera::query()->create([
            'nama_produk' => $data['name'],
            'jenis_kamera' => $data['type'],
            'harga_sewa' => $data['rate'],
            'stok' => $data['stock'],
            'status_ketersediaan' => $data['status'],
        ]);

        return back()->with('success', 'Kamera berhasil ditambahkan.');
    }
}

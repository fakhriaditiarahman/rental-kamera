<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->string('kode_transaksi')->unique();
            $table->foreignId('id_pelanggan')->constrained('pelanggan', 'id_pelanggan')->restrictOnDelete();
            $table->foreignId('id_produk')->constrained('produk', 'id_produk')->restrictOnDelete();
            $table->date('tanggal_sewa');
            $table->date('tanggal_kembali');
            $table->unsignedInteger('durasi_sewa');
            $table->decimal('harga_sewa_saat_transaksi', 12, 2);
            $table->decimal('total_biaya', 12, 2);
            $table->string('status_sewa', 30)->default('menunggu_persetujuan');
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->timestamps();
            $table->index(
                ['id_produk', 'tanggal_sewa', 'tanggal_kembali', 'status_sewa'],
                'transaksi_jadwal_produk_status_idx',
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};

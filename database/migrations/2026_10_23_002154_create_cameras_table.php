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
        Schema::create('produk', function (Blueprint $table) {
            $table->id('id_produk');
            $table->string('nama_produk', 150);
            $table->string('jenis_kamera', 100);
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->decimal('harga_sewa', 12, 2);
            $table->unsignedInteger('stok')->default(1);
            $table->string('status_ketersediaan', 30)->default('Tersedia');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produk');
    }
};

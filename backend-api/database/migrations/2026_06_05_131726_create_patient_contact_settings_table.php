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
        if (!Schema::hasTable('patient_contact_settings')) {
        Schema::create('patient_contact_settings', function (Blueprint $table) {
            $table->id();
            // ... your existing table columns logic (e.g. patient_id, email, is_visible)
            $table->timestamps();
        });
    }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_contact_settings');
    }
};

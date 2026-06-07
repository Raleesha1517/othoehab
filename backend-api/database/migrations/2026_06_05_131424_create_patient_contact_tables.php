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
            Schema::create('patient_contact_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id')->unique();
            $table->string('email')->nullable();
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
        });

        Schema::create('patient_telephones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_contact_setting_id');
            $table->string('telephone_number');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();

            $table->foreign('patient_contact_setting_id')
                ->references('id')
                ->on('patient_contact_settings')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_contact_tables');
    }
};

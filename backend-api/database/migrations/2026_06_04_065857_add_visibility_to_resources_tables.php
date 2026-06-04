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
        // Add visibility tracking on the exercise-patient mapping assignment level
        Schema::table('exercise_patient', function (Blueprint $table) {
            $table->boolean('is_visible')->default(true)->after('custom_notes');
        });

        // Add visibility tracking directly onto the patient documents row tracking
        Schema::table('patient_documents', function (Blueprint $table) {
            $table->boolean('is_visible')->default(true)->after('other_category_detail');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exercise_patient', function (Blueprint $table) {
            $table->dropColumn('is_visible');
        });

        Schema::table('patient_documents', function (Blueprint $table) {
            $table->dropColumn('is_visible');
        });
    }
};

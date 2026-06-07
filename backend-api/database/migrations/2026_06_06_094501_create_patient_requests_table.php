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
        Schema::create('patient_requests', function (Blueprint $table) {
            $table->id();
            // Foreign Key constraints referencing your patients table
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            
            // Core attributes
            $table->string('title'); // Will store categories: Medical Leave, Medical Letters, etc.
            $table->text('description');
            $table->enum('status', ['pending', 'approved', 'not approved'])->default('pending');
            $table->text('reply')->nullable()->default(null);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_requests');
    }
};

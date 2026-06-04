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
        Schema::create('followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade'); // Links to your existing patients table
            $table->date('followup_date'); // Current session date
            $table->text('clinical_decisions')->nullable(); // Clinical notes
            $table->text('allocated_document_name')->nullable(); // Text field for document/exercise names
            $table->date('next_followup_date')->nullable(); // Reminder date
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('followups');
    }
};

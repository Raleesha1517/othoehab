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
        Schema::create('patient_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('template_id')->constrained('word_templates')->onDelete('cascade');
            $table->string('custom_file_path'); // Points to the edited copy containing custom patient metrics
            $table->text('custom_file_url');
            $table->string('status')->default('draft'); // draft, finalized
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_templates');
    }
};

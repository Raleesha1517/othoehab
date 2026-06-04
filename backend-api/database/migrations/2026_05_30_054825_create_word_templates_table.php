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
        Schema::create('word_templates', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // e.g., Knee Ultrasound Assessment Standard Template
            $table->string('file_path'); // Path to blank base template file
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('word_templates');
    }
};

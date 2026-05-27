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
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_code', 6)->unique()->after('id');
            $table->string('role')->default('patient')->after('user_code'); // admin, doctor, hr, patient
            $table->integer('age')->nullable()->after('password');
            $table->string('telephone_number')->nullable()->after('age');
            $table->string('nic_number')->nullable()->after('telephone_number');
            $table->text('address')->nullable()->after('nic_number');
            
            // Make original email nullable since it's optional in your system
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_code', 'role', 'age', 'telephone_number', 'nic_number', 'address']);
        });
    }
};

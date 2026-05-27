<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'user_code',
        'role',
        'age',
        'telephone_number',
        'nic_number',
        'address'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Auto-generate 6-character user code on creation
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            do {
                // Generate 2 random uppercase letters
                $letters = strtoupper(Str::random(2));
                // Generate 4 random digits
                $numbers = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
                
                $generatedCode = $letters . $numbers;
                
            } while (static::where('user_code', $generatedCode)->exists()); // Ensure uniqueness

            $user->user_code = $generatedCode;
        });
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Patient extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'patient_code', 'patient_password', 'name', 'phone', 'age', 
        'email', 'nic_number', 'category', 'other_category_detail', 
        'red_flags', 'description'
    ];

    protected $hidden = ['patient_password']; // Never return password strings over JSON responses

    public function exercises()
    {
        return $this->belongsToMany(Exercise::class, 'exercise_patient')
                    ->withPivot('custom_notes', 'is_visible')
                    ->withCasts(['is_visible' => 'boolean'])
                    ->withTimestamps();
    }

    public function documents()
    {
        return $this->hasMany(PatientDocument::class);
    }

    public function templates()
    {
        return $this->hasMany(PatientTemplate::class);
    }

    public function followups() {
    return $this->hasMany(Followup::class)->orderBy('followup_date', 'desc');
}
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PatientContactSetting extends Model
{
    use HasFactory;

    protected $table = 'patient_contact_settings';

    protected $fillable = [
        'patient_id',
        'email',
        'is_visible'
    ];

    protected $casts = [
        'is_visible' => 'boolean'
    ];

    // Belongs back to the root Patient account
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    // Has many telephone nodes
    public function telephones()
    {
        return $this->hasMany(PatientTelephone::class, 'patient_contact_setting_id');
    }
}
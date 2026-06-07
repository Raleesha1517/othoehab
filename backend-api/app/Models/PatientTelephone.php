<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PatientTelephone extends Model
{
    use HasFactory;

    protected $table = 'patient_telephones';

    protected $fillable = [
        'patient_contact_setting_id',
        'telephone_number',
        'is_primary'
    ];

    protected $casts = [
        'is_primary' => 'boolean'
    ];

    // Belongs back to the main visibility configuration mapping profile
    public function contactSetting()
    {
        return $this->belongsTo(PatientContactSetting::class, 'patient_contact_setting_id');
    }
}
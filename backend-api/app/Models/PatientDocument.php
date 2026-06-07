<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientDocument extends Model
{
    protected $fillable = [
        'patient_id', 'file_name', 'file_path', 'file_url', 
        'file_type', 'category', 'other_category_detail', 'is_visible', 'signed_status'
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}

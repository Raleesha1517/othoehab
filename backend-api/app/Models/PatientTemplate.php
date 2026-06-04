<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientTemplate extends Model
{
    protected $fillable = ['patient_id', 'template_id', 'custom_file_path', 'custom_file_url', 'status'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function baseTemplate()
    {
        return $this->belongsTo(WordTemplate::class, 'template_id');
    }
}

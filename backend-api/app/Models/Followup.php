<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Followup extends Model
{
    protected $fillable = [
    'patient_id', 
    'followup_date', 
    'clinical_decisions', 
    'allocated_document_name', 
    'next_followup_date'
];
public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PatientRequest extends Model
{
    use HasFactory;

    protected $table = 'patient_requests';

    protected $fillable = [
        'patient_id',
        'title',
        'description',
        'status',
        'reply'
    ];

    // Get the patient that made this request
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }
}

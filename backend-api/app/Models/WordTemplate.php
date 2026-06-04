<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WordTemplate extends Model
{
    protected $fillable = ['title', 'file_path'];

    public function patientAssignments()
    {
        return $this->hasMany(PatientTemplate::class, 'template_id');
    }
}

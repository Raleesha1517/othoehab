<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description'];

    /**
     * Relationship with attachments
     */
    public function attachments()
    {
        return $this->hasMany(ExerciseAttachment::class);
    }

    /**
     * Relationship with patients (Pivot System)
     */
    public function patients()
    {
        return $this->belongsToMany(Patient::class, 'exercise_patient')
                    ->withPivot('custom_notes', 'is_visible')
                    ->withCasts(['is_visible' => 'boolean'])
                    ->withTimestamps();
    }
}
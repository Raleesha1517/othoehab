<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExerciseAttachment extends Model
{
    protected $fillable = ['exercise_id', 'type', 'url', 'label'];

    public function exercise()
    {
        return $this->belongsTo(Exercise::class);
    }
}
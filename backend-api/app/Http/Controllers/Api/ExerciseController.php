<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\ExerciseAttachment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ExerciseController extends Controller
{
    /**
     * Display a listing of all exercises with attachments
     */
    public function index()
    {
        // For fallback safety, make sure global indexes include a default visibility key
        $exercises = Exercise::with('attachments')->get()->map(function ($exercise) {
            $exerciseArray = $exercise->toArray();
            if (!isset($exerciseArray['is_visible'])) {
                $exerciseArray['is_visible'] = true;
            }
            return $exerciseArray;
        });

        return response()->json($exercises, 200);
    }

    /**
     * Store a newly created exercise
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $exercise = Exercise::create([
            'title' => $request->name,
            'description' => $request->description
        ]);

        return response()->json(
            ['message' => 'Exercise created successfully.', 'data' => $exercise->load('attachments')],
            210
        );
    }

    /**
     * Display the specified exercise
     */
    public function show($id)
    {
        $exercise = Exercise::with('attachments')->findOrFail($id);
        return response()->json($exercise, 200);
    }

    /**
     * Update the specified exercise
     */
    public function update(Request $request, $id)
    {
        $exercise = Exercise::findOrFail($id);

        $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $exercise->update([
            'title' => $request->name ?? $exercise->title,
            'description' => $request->description ?? $exercise->description
        ]);

        return response()->json(
            ['message' => 'Exercise updated successfully.', 'data' => $exercise->load('attachments')],
            200
        );
    }

    /**
     * Delete the specified exercise
     */
    public function destroy($id)
    {
        $exercise = Exercise::findOrFail($id);
        $exercise->delete();
        return response()->json(['message' => 'Exercise deleted successfully.'], 200);
    }

    /**
     * Upload attachment to exercise (PDF file or URL link)
     */
    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'exercise_id' => 'required|exists:exercises,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:pdf,youtube,drive',
            'file' => 'nullable|file|mimes:pdf|max:10240',
            'url' => 'nullable|url',
        ]);

        $attachmentData = [
            'exercise_id' => $request->exercise_id,
            'label' => $request->title,
            'type' => $request->type,
        ];

        if ($request->type === 'pdf' && $request->hasFile('file')) {
            $filePath = $request->file('file')->store('exercises', 'public');
            $attachmentData['url'] = asset(Storage::url($filePath)); 
        } else if (in_array($request->type, ['youtube', 'drive'])) {
            $attachmentData['url'] = $request->url;
        }

        $attachment = ExerciseAttachment::create($attachmentData);

        return response()->json(
            ['message' => 'Attachment uploaded successfully.', 'data' => $attachment],
            201
        );
    }

    /**
     * Toggle visibility inside the pivot system safely
     */
    public function toggleVisibility(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|integer',
            'exercise_id' => 'required|integer',
            'is_visible' => 'required',
        ]);

        // Clean validation formatting to convert string representations like "false" or 0 to boolean equivalents
        $isVisibleFlag = filter_var($request->is_visible, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

        DB::table('exercise_patient')
            ->where('patient_id', $request->patient_id)
            ->where('exercise_id', $request->exercise_id)
            ->update(['is_visible' => $isVisibleFlag]);

        return response()->json(['success' => true, 'message' => 'Exercise visibility updated.']);
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment($attachmentId)
    {
        $attachment = ExerciseAttachment::findOrFail($attachmentId);
        $attachment->delete();
        return response()->json(['message' => 'Attachment deleted successfully.'], 200);
    }

    /**
     * Assign exercise to patient with custom notes and default visibility
     */
    public function assignToPatient(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'exercise_id' => 'required|exists:exercises,id',
            'custom_notes' => 'nullable|string',
        ]);

        $patient = Patient::findOrFail($request->patient_id);

        // Force a clear assignment status during assignments explicitly
        $patient->exercises()->syncWithoutDetaching([
            $request->exercise_id => [
                'custom_notes' => $request->custom_notes ?? '',
                'is_visible' => true
            ]
        ]);

        return response()->json(['message' => 'Exercise assigned to patient successfully.'], 200);
    }

    /**
     * Get patient's assigned exercises with root-level visibility flag maps
     */
    public function getPatientExercises($patientId)
    {
        $patient = Patient::findOrFail($patientId);
        
        $exercises = $patient->exercises()
            ->with('attachments')
            ->get()
            ->map(function ($exercise) {
                $exerciseArray = $exercise->toArray();
                
                if ($exercise->pivot) {
                    // Extract pivot state casting values accurately
                    $status = filter_var($exercise->pivot->is_visible, FILTER_VALIDATE_BOOLEAN);
                    $exerciseArray['is_visible'] = $status;
                } else {
                    $exerciseArray['is_visible'] = true;
                }
                
                return $exerciseArray;
            })
            ->values()
            ->all();

        return response()->json($exercises, 200);
    }
}
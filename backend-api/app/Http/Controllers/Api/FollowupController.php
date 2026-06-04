<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Followup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FollowupController extends Controller
{
    // List all follow-ups for a specific patient
    public function index($patientId)
    {
        $followups = Followup::where('patient_id', $patientId)
            ->orderBy('followup_date', 'desc')
            ->get();

        return response()->json($followups, 200);
    }

    // Create a new follow-up record
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id'              => 'required|exists:patients,id',
            'followup_date'           => 'required|date',
            'clinical_decisions'      => 'nullable|string',
            'allocated_document_name' => 'nullable|string',
            'next_followup_date'      => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $followup = Followup::create($request->all());

        return response()->json([
            'message' => 'Follow-up created successfully',
            'data'    => $followup
        ], 201);
    }

    // Update an existing follow-up record
    public function update(Request $request, $id)
    {
        $followup = Followup::find($id);

        if (!$followup) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'followup_date'           => 'required|date',
            'clinical_decisions'      => 'nullable|string',
            'allocated_document_name' => 'nullable|string',
            'next_followup_date'      => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $followup->update($request->all());

        return response()->json([
            'message' => 'Follow-up updated successfully',
            'data'    => $followup
        ], 200);
    }

    // Permanently delete a follow-up record
    public function destroy($id)
    {
        $followup = Followup::find($id);

        if (!$followup) {
            return response()->json(['message' => 'Record not found'], 404);
        }

        $followup->delete();

        return response()->json([
            'message' => 'Follow-up record deleted permanently'
        ], 200);
    }
}
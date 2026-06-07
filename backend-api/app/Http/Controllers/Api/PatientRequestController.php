<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PatientRequest;
use App\Models\Patient;

class PatientRequestController extends Controller
{
    // List all requests across the entire clinic system (For Doctors)
    public function index()
    {
        $requests = PatientRequest::with('patient:id,name,patient_code')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests, 200);
    }

    // List requests for a specific logged-in patient
    public function getPatientRequests($patientId)
    {
        $requests = PatientRequest::where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests, 200);
    }

    // Patient stores a new request
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $newRequest = PatientRequest::create([
            'patient_id' => $request->patient_id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'pending',
            'reply' => null
        ]);

        return response()->json([
            'message' => 'Your request has been submitted successfully.',
            'data' => $newRequest
        ], 201);
    }

    // Doctor updates request status and attaches a reply text block
    public function updateStatus(Request $request, $id)
    {
        $patientRequest = PatientRequest::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,approved,not approved',
            'reply' => 'nullable|string'
        ]);

        $patientRequest->update([
            'status' => $request->status,
            'reply' => $request->reply
        ]);

        return response()->json([
            'message' => 'Request status updated completely.',
            'data' => $patientRequest
        ], 200);
    }

    // Delete a request record completely
    public function destroy($id)
    {
        $patientRequest = PatientRequest::findOrFail($id);
        $patientRequest->delete();

        return response()->json(['message' => 'Request structure eliminated successfully.'], 200);
    }
}
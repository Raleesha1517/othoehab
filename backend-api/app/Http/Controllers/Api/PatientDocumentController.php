<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PatientDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PatientDocumentController extends Controller
{
    /**
     * Display a listing of all historical medical documents.
     */
    public function index()
    {
        return response()->json(PatientDocument::latest()->get(), 200);
    }

    /**
     * Get documents bound to a specific patient profile context.
     */
    public function getPatientDocuments($patientId)
{
    $documents = PatientDocument::where('patient_id', $patientId)
        ->latest()
        ->get()
        ->map(function ($doc) {
            return [
                'id' => $doc->id,
                'patient_id' => $doc->patient_id,
                'name' => $doc->file_name,
                'category' => $doc->category,
                'description' => $doc->other_category_detail,
                'file_url' => $doc->file_url,
                'file_type' => $doc->file_type,
                'created_at' => $doc->created_at,
                // Cast directly to ensure standard boolean visibility mapping state
                'isVisible' => filter_var($doc->is_visible, FILTER_VALIDATE_BOOLEAN),
                'signed_status' => $doc->signed_status ?? 'not signed'
            ];
        });

    return response()->json($documents, 200);
}

    /**
     * Handle multi-part form data uploads for patient document profiles.
     */
    public function store(Request $request)
    {
        // 1. Explicitly validate all inbound fields from Angular
        $request->validate([
            'patient_id'            => 'required|exists:patients,id',
            'file'                  => 'required|file|mimes:jpeg,png,jpg,pdf,docx,doc|max:15360', 
            'category'              => 'required|string',
            'other_category_detail' => 'nullable|string',
            'signed_status'         => 'nullable|string|in:signed,not signed,no need signed',
        ]);

        if ($request->hasFile('file')) {
            $fileObj = $request->file('file');
            $originalCleanedName = $fileObj->getClientOriginalName();
            $ext = $fileObj->getClientOriginalExtension();

            $generatedSystemName = time() . '_' . Str::slug(pathinfo($originalCleanedName, PATHINFO_FILENAME)) . '.' . $ext;
            
            $fileObj->move(public_path('uploads/documents'), $generatedSystemName);
            $storedRelativePath = 'uploads/documents/' . $generatedSystemName;

            // 2. Safe resolution of description keys
            $descriptionText = $request->get('other_category_detail') ?? $request->get('description');

            $document = PatientDocument::create([
                'patient_id'            => $request->patient_id,
                'file_name'             => $originalCleanedName,
                'file_path'             => $storedRelativePath,
                'file_url'              => asset($storedRelativePath), 
                'file_type'             => $ext,
                'category'              => $request->category,
                'other_category_detail' => $descriptionText,
                'signed_status'         => $request->get('signed_status', 'not signed'),
                'is_visible'            => true, // Explicit fallback structure
            ]);

            return response()->json([
                'message' => 'Diagnostic material saved successfully.', 
                'document' => $document
            ], 201);
        }

        return response()->json(['message' => 'Missing diagnostic upload binary.'], 400);
    }

    /**
     * Update signed status and replace document file payload if necessary.
     * PUT /api/patient-documents/{id}/update-status
     */
    public function updateStatusAndFile(Request $request, $id)
    {
        $request->validate([
            'signed_status' => 'required|string|in:signed,not signed,no need signed',
            'file'          => 'nullable|file|mimes:jpeg,png,jpg,pdf,docx,doc|max:15360',
        ]);

        $document = PatientDocument::findOrFail($id);
        
        $updateData = [
            'signed_status' => $request->signed_status
        ];

        // Check if an updated document replacement file has been provided
        if ($request->hasFile('file')) {
            // Delete historical file binary tracking records safely from local public folder
            $oldSystemPath = public_path($document->file_path);
            if (file_exists($oldSystemPath)) {
                @unlink($oldSystemPath);
            }

            $fileObj = $request->file('file');
            $originalCleanedName = $fileObj->getClientOriginalName();
            $ext = $fileObj->getClientOriginalExtension();

            // We generate a fresh link tracking name to clear out cache parameters
            $generatedSystemName = time() . '_' . Str::slug(pathinfo($originalCleanedName, PATHINFO_FILENAME)) . '.' . $ext;
            $fileObj->move(public_path('uploads/documents'), $generatedSystemName);
            
            $storedRelativePath = 'uploads/documents/' . $generatedSystemName;
            
            $updateData['file_name'] = $originalCleanedName;
            $updateData['file_path'] = $storedRelativePath;
            $updateData['file_url']  = asset($storedRelativePath);
            $updateData['file_type'] = $ext;
        }

        $document->update($updateData);

        return response()->json([
            'message' => 'Document signatures parameters updated successfully.',
            'document' => $document
        ], 200);
    }

    /**
     * Display structural data of a single distinct document entity.
     */
    public function show($id)
    {
        $document = PatientDocument::findOrFail($id);
        return response()->json($document, 200);
    }

    /**
     * Update document metadata parameters.
     */
    public function update(Request $request, $id)
    {
        $document = PatientDocument::findOrFail($id);
        
        $document->update([
            'category' => $request->get('category', $document->category),
            'other_category_detail' => $request->get('description', $document->other_category_detail),
        ]);

        return response()->json(['message' => 'Metadata log updated completely.', 'document' => $document], 200);
    }

    /**
     * Delete document context structural registry elements and file binary data storage.
     */
    public function destroy($id)
    {
        $document = PatientDocument::findOrFail($id);
        $fullSystemPath = public_path($document->file_path);

        if (file_exists($fullSystemPath)) {
            @unlink($fullSystemPath);
        }

        $document->delete();
        return response()->json(['message' => 'Medical tracking asset deleted completely from ecosystem registry.'], 200);
    }

    public function toggleVisibility(Request $request, $id)
{
    $request->validate([
        'is_visible' => 'required|boolean',
    ]);

    $document = PatientDocument::findOrFail($id);
    $document->update([
        'is_visible' => $request->is_visible
    ]);

    return response()->json(['success' => true, 'message' => 'Document visibility updated.']);
}


    /**
     * Streams file matching entity reference targets back to client dashboard interface framework.
     */
    public function download($id)
    {
        $document = PatientDocument::findOrFail($id);
        $fullPath = public_path($document->file_path);

        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'Target application storage target binary has expired or cannot be read.'], 404);
        }

        return response()->download($fullPath, $document->file_name);
    }

    /**
     * Provide list of explicit medical categories supported by the platform schema system design parameters.
     */
    public function categories()
    {
        return response()->json([
            'Medical Report',
            'Assessment Form',
            'Treatment Plan',
            'Progress Notes',
            'Lab Results',
            'Imaging Report',
            'Discharge Summary',
            'Other'
        ], 200);
    }
}
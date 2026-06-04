<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WordTemplate;
use Illuminate\Support\Facades\File; // Required for File::exists and File::delete operations

class TemplateController extends Controller
{
    // Fetch all clinical report skeletons
    public function indexTemplates()
    {
        return response()->json(WordTemplate::all(), 200);
    }

    // NEW: Fetch a single template by ID (Matches Angular getTemplateById)
    public function showTemplate($id)
    {
        $template = WordTemplate::find($id);
        if (!$template) {
            return response()->json(['message' => 'Template structure not found.'], 404);
        }
        return response()->json($template, 200);
    }

    // FIXED: Added storeTemplate to handle Angular uploadTemplate() POST payload
    public function storeTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,doc,docx|max:10240', // Supports PDF & Word documents up to 10MB
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            // Generate a clean name to eliminate file system collision risks
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Move file to application public layout directory paths
            $file->move(public_path('uploads/templates'), $filename);
            $storedPath = 'uploads/templates/' . $filename;

            // Map data directly to database model definitions
            $template = WordTemplate::create([
                'title' => $request->name,
                'file_path' => $storedPath,
            ]);

            return response()->json([
                'message' => 'Master template framework registered successfully.',
                'data' => $template
            ], 201);
        }

        return response()->json(['message' => 'File payload construction error.'], 400);
    }

    // NEW: Purge structural template entries from filesystem and backend tables completely
    public function deleteTemplate($id)
    {
        $template = WordTemplate::find($id);

        if (!$template) {
            return response()->json(['message' => 'Template target reference not found.'], 404);
        }

        // Clean out the underlying raw tracking file from local folders if present
        $absolutePath = public_path($template->file_path);
        if (File::exists($absolutePath)) {
            File::delete($absolutePath);
        }

        $template->delete();

        return response()->json(['message' => 'Structural skeleton profile purged completely.'], 200);
    }

    // Assign custom edited .docx variations to specific patient case files
    public function assignPatientTemplate(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'template_id' => 'required|exists:word_templates,id',
            'file' => 'required|file|mimes:docx|max:10240', // Limit to 10MB Word targets
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $systemCleanedName = time() . '_patient_' . $request->patient_id . '_report.docx';
            
            // File customized modification variants down to individualized targets folders
            $file->move(public_path('uploads/patient_reports'), $systemCleanedName);
            $storedPath = 'uploads/patient_reports/' . $systemCleanedName;

            // Note: Ensure your PatientTemplate model is imported if you run into exceptions here
            $patientReport = \App\Models\PatientTemplate::create([
                'patient_id' => $request->patient_id,
                'template_id' => $request->template_id,
                'custom_file_path' => $storedPath,
                'custom_file_url' => asset($storedPath),
                'status' => $request->status ?? 'draft'
            ]);

            return response()->json(['message' => 'Personalized medical evaluation assigned successfully.', 'data' => $patientReport], 201);
        }
        
        return response()->json(['message' => 'File operation error.'], 400);
    }

    public function downloadTemplateFile($id)
    {
        $template = WordTemplate::find($id);

        if (!$template || !File::exists(public_path($template->file_path))) {
            return response()->json(['message' => 'File data could not be localized on storage disk nodes.'], 404);
        }

        return response()->download(public_path($template->file_path));
    }
}
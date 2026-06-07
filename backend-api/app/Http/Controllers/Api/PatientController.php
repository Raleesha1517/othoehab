<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Patient;

class PatientController extends Controller
{
    public function index()
    {
        return response()->json(Patient::latest()->get(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'patient_password' => 'required|string|min:6',
            'category' => 'required|string|max:255',
            'email' => 'nullable|email|unique:patients,email',
            'phone' => 'nullable|string',
            'age' => 'nullable|integer',
        ]);

        $cleanName = strtoupper(substr(str_replace(' ', '', $request->name), 0, 2));
        $cleanCategory = strtoupper(substr(str_replace(' ', '', $request->category), 0, 1));

        do {
            $randomNumbers = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $computedPatientCode = $cleanName . $randomNumbers . $cleanCategory;
        } while (Patient::where('patient_code', $computedPatientCode)->exists());

        $patient = Patient::create([
            'patient_code' => $computedPatientCode,
            'patient_password' => Hash::make($request->patient_password),
            'name' => $request->name,
            'phone' => $request->phone,
            'age' => $request->age,
            'email' => $request->email,
            'nic_number' => $request->nic_number,
            'category' => $request->category,
            'other_category_detail' => $request->other_category_detail,
            'red_flags' => $request->red_flags,
            'description' => $request->description,
        ]);

        // 🌟 AUTOMATION: Instantly seed fallback visibility settings on account genesis
        $contactSetting = $patient->contactSetting()->create([
            'email' => $patient->email,
            'is_visible' => true
        ]);

        if ($patient->phone) {
            $contactSetting->telephones()->create([
                'telephone_number' => $patient->phone,
                'is_primary' => true
            ]);
        }

        return response()->json([
            'message' => 'Patient account initiated successfully.',
            'patient_code' => $patient->patient_code,
            'data' => $patient
        ], 201);
    }

    public function show($id)
    {
        // 🌟 UPDATED: Eager loads nested contact profiles straight to Angular
        $patient = Patient::with([
            'exercises.attachments', 
            'documents', 
            'templates.baseTemplate', 
            'contactSetting.telephones'
        ])->findOrFail($id);

        return response()->json($patient, 200);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'patient_password' => 'nullable|string|min:6', // Validate password if provided
        ]);

        // Capture standard modifications while keeping tracking codes immutable
        $updateData = $request->except(['patient_code', 'patient_password']);
        
        $passwordChanged = false;
        if ($request->filled('patient_password')) {
            $updateData['patient_password'] = Hash::make($request->patient_password);
            $passwordChanged = true;
        }

        $patient->update($updateData);

        return response()->json([
            'message' => 'Patient medical log modified successfully.',
            'password_updated' => $passwordChanged,
            'data' => $patient
        ], 200);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete(); 
        return response()->json(['message' => 'Patient history trace eliminated completely.'], 200);
    }
}
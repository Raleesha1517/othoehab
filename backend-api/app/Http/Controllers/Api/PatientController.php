<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; // 🧠 Missing Import 1: Resolves password hashing crashes
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

        // ALGORITHM: 2 letters from Name + 4 random digits + 1 letter from Category
        $cleanName = strtoupper(substr(str_replace(' ', '', $request->name), 0, 2));
        $cleanCategory = strtoupper(substr(str_replace(' ', '', $request->category), 0, 1));

        do {
            $randomNumbers = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $computedPatientCode = $cleanName . $randomNumbers . $cleanCategory;
        } while (Patient::where('patient_code', $computedPatientCode)->exists()); // Collision guard loop

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

        return response()->json([
            'message' => 'Patient account initiated successfully.',
            'patient_code' => $patient->patient_code,
            'data' => $patient
        ], 201);
    }

    public function show($id)
    {
        $patient = Patient::with(['exercises.attachments', 'documents', 'templates.baseTemplate'])->findOrFail($id);
        return response()->json($patient, 200);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
        ]);

        // Retain code configuration fields cleanly unless password modifications are explicitly provided
        $patient->update($request->except(['patient_code', 'patient_password']));

        return response()->json([
            'message' => 'Patient medical log modified.',
            'data' => $patient
        ], 200);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete(); // Automatically purges related cascading documents/pivot bindings
        return response()->json(['message' => 'Patient history trace eliminated completely.'], 200);
    }
}

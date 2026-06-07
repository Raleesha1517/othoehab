<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PatientContactSetting;
use App\Models\PatientTelephone;
use Illuminate\Support\Facades\DB;

class PatientContactController extends Controller
{
    /**
     * Retrieve the contact details profile block by patient ID
     */
    public function show($patientId)
    {
        $contactSetting = PatientContactSetting::with('telephones')
            ->where('patient_id', $patientId)
            ->firstOrFail();

        return response()->json($contactSetting, 200);
    }

    /**
     * Store or update contact data configurations + telephone lists
     */
    public function updateOrCreateContact(Request $request, $patientId)
    {
        $request->validate([
            'email' => 'nullable|email',
            'is_visible' => 'required|boolean',
            'telephones' => 'required|array|min:1',
            'telephones.*.telephone_number' => 'required|string|max:20',
            'telephones.*.is_primary' => 'required|boolean'
        ]);

        try {
            DB::beginTransaction();

            // 1. Update or create parent configuration rule
            $contactSetting = PatientContactSetting::updateOrCreate(
                ['patient_id' => $patientId],
                [
                    'email' => $request->email,
                    'is_visible' => $request->is_visible
                ]
            );

            // 2. Wipe old mapping numbers to clear or re-commit modifications cleanly
            $contactSetting->telephones()->delete();

            // 3. Populate new numbers stack
            foreach ($request->telephones as $phone) {
                $contactSetting->telephones()->create([
                    'telephone_number' => $phone['telephone_number'],
                    'is_primary' => $phone['is_primary']
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Patient contact directory profile saved.',
                'data' => $contactSetting->load('telephones')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to process transactions.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Light toggle utility action endpoint specifically for changing patient visibility flag state quickly
     */
    public function toggleVisibility(Request $request, $patientId)
    {
        $request->validate([
            'is_visible' => 'required|boolean'
        ]);

        $contactSetting = PatientContactSetting::where('patient_id', $patientId)->firstOrFail();
        $contactSetting->is_visible = $request->is_visible;
        $contactSetting->save();

        return response()->json([
            'message' => 'Patient dashboard view visibility status altered.',
            'is_visible' => $contactSetting->is_visible
        ], 200);
    }
}
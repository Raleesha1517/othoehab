<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:admin,doctor,hr,patient',
            'email' => 'nullable|string|email|max:255|unique:users',
            'age' => 'nullable|integer|min:1|max:120',
            'telephone_number' => 'nullable|string',
            'nic_number' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'email' => $request->email,
            'age' => $request->age,
            'telephone_number' => $request->telephone_number,
            'nic_number' => $request->nic_number,
            'address' => $request->address,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account registered successfully!',
            'user_code' => $user->user_code,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    public function login(Request $request)
{
    $request->validate([
        'login_identifier' => 'required|string',
        'password' => 'required|string'
    ]);

    $identifier = $request->login_identifier;

    // 1. Check if identifier is an email address (Always maps to User table)
    if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
        $user = User::where('email', $identifier)->first();
        if ($user && Hash::check($request->password, $user->password)) {
            return $this->generateUserResponse($user);
        }
    } else {
        // 2. Check User Table by user_code OR name
        $user = User::where('user_code', $identifier)
                    ->orWhere('name', $identifier)
                    ->first();
                    
        if ($user && Hash::check($request->password, $user->password)) {
            return $this->generateUserResponse($user);
        }
    }

    // 3. Check Patient Table by patient_code OR name
    $patient = Patient::where('patient_code', $identifier)
                      ->orWhere('name', $identifier)
                      ->first();

    if ($patient && Hash::check($request->password, $patient->patient_password)) {
        $token = $patient->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'role' => 'patient',
            'user_code' => $patient->patient_code,
            'name' => $patient->name,
            'type' => 'patient',
            'patient_id' => $patient->id
        ], 200);
    }

    return response()->json(['message' => 'Invalid authentication credentials or password mismatch.'], 401);
}

/**
 * Helper to generate standardized JSON payload for Admin, Doctor, and HR users
 */
private function generateUserResponse($user)
{
    $token = $user->createToken('auth_token')->plainTextToken;
    return response()->json([
        'access_token' => $token,
        'token_type' => 'Bearer',
        'role' => strtolower($user->role),
        'user_code' => $user->user_code,
        'name' => $user->name,
        'type' => 'user'
    ], 200);
}

    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Successfully logged out.']);
    }
}

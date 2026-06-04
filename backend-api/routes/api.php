<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\PatientDocumentController;
use App\Http\Controllers\Api\TemplateController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Core Isolated Patient CRUD Map
    Route::apiResource('patients', PatientController::class);

    // Exercise Subsystem & Prescription Target Links
    // Note: Custom endpoints are explicitly placed ABOVE apiResource to prevent parameter matching conflicts
    Route::post('exercises/toggle-visibility', [ExerciseController::class, 'toggleVisibility']);
    Route::post('exercises/assign', [ExerciseController::class, 'assignToPatient']);
    Route::get('patients/{patientId}/exercises', [ExerciseController::class, 'getPatientExercises']);
    Route::apiResource('exercises', ExerciseController::class);
    
    Route::post('exercise-attachments', [ExerciseController::class, 'uploadAttachment']);
    Route::delete('exercise-attachments/{attachmentId}', [ExerciseController::class, 'deleteAttachment']);

    // Media Upload Handlers routed contextually to standard store structure
    Route::post('patients/upload-document', [PatientDocumentController::class, 'store']);

    // Word Document Template Reporting Maps
    Route::get('clinical-templates', [TemplateController::class, 'indexTemplates']);
    Route::get('clinical-templates/{id}', [TemplateController::class, 'showTemplate']); 
    Route::post('clinical-templates', [TemplateController::class, 'storeTemplate']);     
    Route::delete('clinical-templates/{id}', [TemplateController::class, 'deleteTemplate']); 
    Route::post('clinical-templates/assign', [TemplateController::class, 'assignPatientTemplate']);
    Route::get('clinical-templates/{id}/download', [TemplateController::class, 'downloadTemplateFile']);

    // Patient Documents Management System Subsystem Routes
    Route::get('patient-documents/categories', [PatientDocumentController::class, 'categories']);
    Route::get('patient-documents/{id}/download', [PatientDocumentController::class, 'download']);
    Route::get('patients/{patientId}/documents', [PatientDocumentController::class, 'getPatientDocuments']);
    
    // Explicit visibility modifier placed above resource map to intercept route lookup properly
    Route::put('patient-documents/{id}/toggle-visibility', [PatientDocumentController::class, 'toggleVisibility']);
    Route::apiResource('patient-documents', PatientDocumentController::class);
});
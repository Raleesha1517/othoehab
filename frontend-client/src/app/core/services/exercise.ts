import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Exercise {
  private apiUrl = `${environment.apiUrl}/exercises`;
  private attachmentUrl = `${environment.apiUrl}/exercise-attachments`;

  constructor(private http: HttpClient, private auth: Auth) {}

  getExercises(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  getExerciseById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  createExercise(exerciseData: any): Observable<any> {
    return this.http.post(this.apiUrl, exerciseData, this.getHeaders());
  }

  updateExercise(id: number, exerciseData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, exerciseData, this.getHeaders());
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  uploadAttachment(exerciseId: number, attachmentData: any): Observable<any> {
    const formData = new FormData();
    formData.append('exercise_id', exerciseId.toString());
    formData.append('title', attachmentData.title);
    formData.append('type', attachmentData.type); 

    if (attachmentData.type === 'pdf' && attachmentData.url_or_file instanceof File) {
      formData.append('file', attachmentData.url_or_file);
    } else {
      formData.append('url', attachmentData.url_or_file);
    }

    return this.http.post(this.attachmentUrl, formData, this.getHeaders());
  }

  deleteAttachment(attachmentId: number): Observable<any> {
    return this.http.delete(`${this.attachmentUrl}/${attachmentId}`, this.getHeaders());
  }

  assignExerciseToPatient(patientId: number, exerciseId: number, customNotes?: string): Observable<any> {
    const payload = {
      patient_id: patientId,
      exercise_id: exerciseId,
      custom_notes: customNotes || ''
    };
    return this.http.post(`${this.apiUrl}/assign`, payload, this.getHeaders());
  }

  getPatientExercises(patientId: number): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/patients/${patientId}/exercises`,
      this.getHeaders()
    );
  }

  /**
   * Persists the visibility rules linking an exercise to a pivot patient
   * Calls POST to: /api/exercises/toggle-visibility
   */
  toggleExerciseVisibility(patientId: number, exerciseId: number, isVisible: boolean): Observable<any> {
    const payload = {
      patient_id: patientId,
      exercise_id: exerciseId,
      is_visible: isVisible ? 1 : 0
    };
    return this.http.post(`${this.apiUrl}/toggle-visibility`, payload, this.getHeaders());
  }

  private getHeaders() {
    const token = this.auth.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headers) };
  }
}
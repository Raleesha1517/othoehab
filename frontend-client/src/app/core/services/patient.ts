import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class Patient {
  private apiUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient, private auth: Auth) {}

  // Fetch all patients
  getPatients(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  // Get a single detailed patient profile
  getPatientById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Register a completely standalone patient (creates password & unique code dynamically)
  createPatient(patientData: any): Observable<any> {
    return this.http.post(this.apiUrl, patientData, this.getHeaders());
  }

  // Update standalone patient medical logs
  updatePatient(id: number, patientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, patientData, this.getHeaders());
  }

  // Delete a patient history file
  deletePatient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Helper method to pull headers dynamically from your existing auth file
  private getHeaders() {
    const token = this.auth.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headers) };
  }
}

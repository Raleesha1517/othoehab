import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 👈 Added HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestTracker {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // 🌟 HELPER: Dynamically construct the authorization header for Sanctum authentication
  private getAuthHeaders() {
    const token = localStorage.getItem('token'); // 👈 Verify if your token is stored under 'token' or another key (e.g., 'auth_token')
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      })
    };
  }

  getAllRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/patient-requests`, this.getAuthHeaders());
  }

  getRequestsByPatient(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/patients/${patientId}/requests`, this.getAuthHeaders());
  }

  createRequest(payload: { patient_id: number; title: string; description: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/patient-requests`, payload, this.getAuthHeaders());
  }

  updateRequestStatus(id: number, payload: { status: string; reply: string | null }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/patient-requests/${id}/status`, payload, this.getAuthHeaders());
  }

  deleteRequest(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/patient-requests/${id}`, this.getAuthHeaders());
  }
}
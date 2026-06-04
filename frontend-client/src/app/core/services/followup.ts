import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Matches your non-prod setup dynamically
import { Auth } from './auth'; // Adjust path if necessary to point to your auth service location

export interface Followup {
  id?: number;
  patient_id: number;
  followup_date: string;
  clinical_decisions: string;
  allocated_document_name: string;
  next_followup_date: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FollowupService {
  private apiUrl = `${environment.apiUrl}`;

  // Injecting both HttpClient and your custom Auth service dependency here
  constructor(private http: HttpClient, private auth: Auth) {}

  // Fetch all historical session entries for a specific patient
  getPatientFollowups(patientId: number): Observable<Followup[]> {
    return this.http.get<Followup[]>(`${this.apiUrl}/patients/${patientId}/followups`, this.getHeaders());
  }

  // Create a new follow-up timeline record
  addFollowup(followup: Followup): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/followups`, followup, this.getHeaders());
  }

  // Modify an existing record session log entry
  updateFollowup(id: number, followup: Followup): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/followups/${id}`, followup, this.getHeaders());
  }

  // Permanently remove a follow-up log entry row
  deleteFollowup(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/followups/${id}`, this.getHeaders());
  }

  /**
   * Helper method to seamlessly inject Sanctum's token authorization matrix
   * directly from your existing application session states.
   */
  private getHeaders() {
    const token = this.auth.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headers) };
  }
}
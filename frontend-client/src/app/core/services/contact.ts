import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 🌟 Inject HttpHeaders
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; 

export interface PatientTelephone {
  id?: number;
  patient_contact_setting_id?: number;
  telephone_number: string;
  is_primary: boolean;
}

export interface PatientContactSetting {
  id?: number;
  patient_id: number;
  email: string | null;
  is_visible: boolean;
  telephones: PatientTelephone[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Contact {
  private apiUrl = `${environment.apiUrl}/patients`; 

  constructor(private http: HttpClient) {}

  /**
   * Helper method to generate headers containing your authentication token
   */
  private getAuthHeaders(): HttpHeaders {
    // 💡 Update 'token' to match whatever key name you use to save the token during login
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token'); 
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Fetch contact profile setup by Patient ID
   */
  getContactSettings(patientId: number): Observable<PatientContactSetting> {
    return this.http.get<PatientContactSetting>(
      `${this.apiUrl}/${patientId}/contact-settings`,
      { headers: this.getAuthHeaders() } // 🌟 Added headers
    );
  }

  /**
   * Store or completely update contact details
   */
  saveContactSettings(patientId: number, settings: PatientContactSetting): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${patientId}/contact-settings`, 
      settings,
      { headers: this.getAuthHeaders() } // 🌟 Added headers
    );
  }

  /**
   * Fast toggle interaction framework tracking visibility state
   */
  toggleVisibility(patientId: number, isVisible: boolean): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${patientId}/contact-settings/visibility`, 
      { is_visible: isVisible },
      { headers: this.getAuthHeaders() } // 🌟 Added headers
    );
  }
}
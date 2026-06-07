import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientDocumentService {
  private apiUrl = `${environment.apiUrl}/patients/upload-document`;
  private baseDocUrl = `${environment.apiUrl}/patient-documents`;

  constructor(private http: HttpClient, private auth: Auth) {}

  uploadDocument(
    patientId: number, 
    file: File, 
    category: string, 
    otherDetails?: string,
    signedStatus?: string // <-- Added parameter here
  ): Observable<any> {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('file', file);
    formData.append('category', category);
    
    if (otherDetails) {
      formData.append('other_category_detail', otherDetails);
    }

    // Appends the signature value or falls back safely to 'not signed'
    formData.append('signed_status', signedStatus || 'not signed');

    return this.http.post(this.apiUrl, formData, this.getHeaders());
  }

  getPatientDocuments(patientId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/patients/${patientId}/documents`, this.getHeaders());
  }

  downloadDocument(documentId: number): Observable<Blob> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.get(`${this.baseDocUrl}/${documentId}/download`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.baseDocUrl}/${documentId}`, this.getHeaders());
  }

  updateDocumentStatus(documentId: number, signedStatus: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('signed_status', signedStatus);
    if (file) {
      formData.append('file', file);
    }
    return this.http.post(`${this.baseDocUrl}/${documentId}/update-status?_method=PUT`, formData, this.getHeaders());
  }

  /**
   * Persists the visibility status parameters of a general patient tracking document back into the DB
   * Calls PUT to: /api/patient-documents/{id}/toggle-visibility
   */
  toggleDocumentVisibility(documentId: number, isVisible: boolean): Observable<any> {
    const payload = { is_visible: isVisible ? 1 : 0 };
    return this.http.put(`${this.baseDocUrl}/${documentId}/toggle-visibility`, payload, this.getHeaders());
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
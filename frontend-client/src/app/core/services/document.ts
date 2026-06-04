import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Auth } from './auth';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class Document {
  private apiUrl = `${environment.apiUrl}/patients/upload-document`;

  constructor(private http: HttpClient, private auth: Auth) {}

  // Transmits binary objects natively alongside categorization metadata parameters
  uploadDocument(patientId: number, file: File, category: string, otherDetails?: string): Observable<any> {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('file', file);
    formData.append('category', category);
    
    if (otherDetails) {
      formData.append('other_category_detail', otherDetails);
    }

    // Note: Do NOT set Content-Type header manually here; let the browser establish boundaries for multipart data
    return this.http.post(this.apiUrl, formData, this.getHeaders());
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

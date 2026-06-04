import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from './auth';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Template {
  private apiUrl = `${environment.apiUrl}/clinical-templates`;

  constructor(private http: HttpClient, private auth: Auth) {}

  // Query master structural templates (e.g., Ultrasound Standard Framework)
  getClinicalTemplates(): Observable<any> {
    return this.http.get(this.apiUrl, this.getHeaders());
  }

  // Get single template
  getTemplateById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Upload a new template (PDF or Word file)
  uploadTemplate(file: File, templateName: string, description?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', templateName);
    formData.append('description', description || '');
    formData.append('file_type', file.type);

    return this.http.post(this.apiUrl, formData, this.getHeaders());
  }

  // Download template file
  // downloadTemplate(templateId: number): Observable<Blob> {
  //   return this.http.get(
  //     `${this.apiUrl}/${templateId}/download`,
  //     {
  //       ...this.getHeaders(),
  //       responseType: 'blob'
  //     } as any
  //   );
  // }

  downloadTemplate(templateId: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${templateId}/download`, {
    headers: this.getHeaders().headers, // Extract just the HttpHeaders instance if getHeaders() returns an options block
    responseType: 'blob'                // Keep this explicitly typed without 'as any'
  });
}

  // Delete template
  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // Submit a custom edited patient evaluation document variant back to the case storage profile
  assignCustomPatientTemplate(patientId: number, templateId: number, file: File, status: string = 'draft'): Observable<any> {
    const formData = new FormData();
    formData.append('patient_id', patientId.toString());
    formData.append('template_id', templateId.toString());
    formData.append('file', file);
    formData.append('status', status);

    return this.http.post(`${this.apiUrl}/assign`, formData, this.getHeaders());
  }

  // Get patient's assigned templates
  getPatientTemplates(patientId: number): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/patients/${patientId}/templates`,
      this.getHeaders()
    );
  }

  // Search templates by name
  searchTemplates(query: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}?search=${query}`,
      this.getHeaders()
    );
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

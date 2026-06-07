import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, this.getAuthHeaders());
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, this.getAuthHeaders());
  }

  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  getUserRole(): string | null {
    const role = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    return role ? role.toLowerCase() : null;
  }

  getUserName(): string {
    return typeof window !== 'undefined'
      ? (localStorage.getItem('user_name') ?? '')
      : '';
  }

  getUserCode(): string {
    return typeof window !== 'undefined'
      ? (localStorage.getItem('user_code') ?? '')
      : '';
  }

  getPatientId(): string {
    return typeof window !== 'undefined'
      ? (localStorage.getItem('patient_id') ?? '')
      : '';
  }

  getUserType(): string {
    return typeof window !== 'undefined'
      ? (localStorage.getItem('user_type') ?? 'user')
      : 'user';
  }

  setUserRole(role: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (role) {
      localStorage.setItem('user_role', role.toLowerCase());
    } else {
      localStorage.removeItem('user_role');
    }
  }

  setPatientId(patientId: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (patientId) {
      localStorage.setItem('patient_id', patientId);
    } else {
      localStorage.removeItem('patient_id');
    }
  }

  setUserType(type: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (type) {
      localStorage.setItem('user_type', type);
    } else {
      localStorage.removeItem('user_type');
    }
  }

  ensureUserRole(): Observable<string | null> {
    const role = this.getUserRole();

    if (role) {
      return of(role);
    }

    if (!this.getToken()) {
      return of(null);
    }

    return this.getUser().pipe(
      map((user) => {
        const resolved = user?.role ? user.role.toString().toLowerCase() : null;
        this.setUserRole(resolved);
        return resolved;
      }),
      catchError(() => of(null))
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private getAuthHeaders() {
    const token = this.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return { headers: new HttpHeaders(headers) };
  }

  // Add this inside your existing Auth service class file
getDoctors(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/users`, this.getAuthHeaders()).pipe(
    map((users: any) => {
      return Array.isArray(users) 
        ? users.filter(u => u.role && u.role.toString().toLowerCase() === 'doctor') 
        : [];
    }),
    catchError(() => of([]))
  );
}

// Add this update profile method to save edited doctor details
updateProfile(profileData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/user/update`, profileData, this.getAuthHeaders());
}
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { PatientDocumentService } from '../../../core/services/patient-document'; 
import { Patient } from '../../../core/services/patient'; 
import { RequestTracker } from '../../../core/services/request-tracker'; // 👈 Injected RequestTracker service metric references
import { forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit { 
  isMobileMenuOpen = false;
  unsignedCount = 0; 
  pendingRequestsCount = 0; // 👈 Track dynamic number of pending patient document requests

  constructor(
    public auth: Auth,
    private router: Router,
    private documentService: PatientDocumentService, 
    private patientService: Patient, 
    private requestService: RequestTracker, // 👈 Added service instance parameter to dependency injection allocation block
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn && this.role === 'doctor') {
      this.calculateUnsignedDocumentsCount();
      this.calculatePendingRequestsCount(); // 👈 Trigger counting loops automatically upon initialization
    }
  }

  // 🧠 Fetch and aggregate pending custom validation request logs from server records backend API
  calculatePendingRequestsCount(): void {
    this.requestService.getAllRequests().pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (requests) => {
        if (requests && Array.isArray(requests)) {
          // Filter down results match parameter arrays where standard state status reads precisely 'pending'
          const pending = requests.filter(r => r.status?.toLowerCase() === 'pending');
          this.pendingRequestsCount = pending.length;
        } else {
          this.pendingRequestsCount = 0;
        }
        this.cdr.markForCheck(); // Push structural template changes onto view engine layout tree layers
      },
      error: () => {
        this.pendingRequestsCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  calculateUnsignedDocumentsCount(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        if (!patients || patients.length === 0) {
          this.unsignedCount = 0;
          this.cdr.markForCheck();
          return;
        }

        const documentRequests: Observable<any[]>[] = patients.map((p: any) => 
          this.documentService.getPatientDocuments(p.id).pipe(
            catchError(() => of([]))
          )
        );

        forkJoin<Observable<any[]>[]>(documentRequests).subscribe({
          next: (results: any) => {
            let count = 0;
            const resultsArray = results as any[][];
            
            resultsArray.forEach((docList) => {
              if (docList && Array.isArray(docList)) {
                const pendingDocs = docList.filter(d => d.signed_status === 'not signed');
                count += pendingDocs.length;
              }
            });

            this.unsignedCount = count;
            this.cdr.markForCheck(); 
          },
          error: () => {
            this.unsignedCount = 0;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.unsignedCount = 0;
        this.cdr.markForCheck();
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  get role(): string | null {
    return this.auth.getUserRole();
  }

  get userName(): string {
    return this.auth.getUserName();
  }

  navigateToProfile(): void {
    this.isMobileMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  logout() {
    Swal.fire({
      title: 'Sign out?',
      text: 'You will be returned to the login screen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Stay',
      confirmButtonColor: '#0B1F3A',
      cancelButtonColor: '#718096',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout().subscribe({
          next: () => this.clearAndRedirect(),
          error: () => this.clearAndRedirect(),
        });
      }
    });
  }

  get homeRoute(): string {
    if (!this.isLoggedIn) return '/';
    
    switch (this.role) {
      case 'admin': return '/admin-dashboard';
      case 'doctor': return '/doctor-dashboard';
      case 'hr': return '/hr-dashboard';
      case 'patient': return '/patient-dashboard';
      default: return '/';
    }
  }

  private clearAndRedirect() {
    localStorage.clear();
    Swal.fire({
      icon: 'success',
      title: 'Signed out',
      text: 'You have been logged out successfully.',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => this.router.navigate(['/']));
  }
}
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Auth } from '../../../core/services/auth';
import { Patient } from '../../../core/services/patient';
import { Exercise } from '../../../core/services/exercise';
import { PatientDocumentService } from '../../../core/services/patient-document';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-home.html',
  styleUrl: './patient-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientHome implements OnInit {
  patientDetails: any = null;
  isLoading = true;
  resourcesLoading = true;

  // Trackable Resource Stores Matching Doctor Home Structure
  exercises: any[] = [];
  medicalRecords: any[] = [];
  medicalLetters: any[] = [];

  // Active Preview Properties
  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  constructor(
    private authService: Auth,
    private patientService: Patient,
    private exerciseService: Exercise,
    private documentService: PatientDocumentService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadPatientDashboardData();
  }

  loadPatientDashboardData(): void {
    const patientIdStr = this.authService.getPatientId();
    
    // Defensive check: If refresh clears memory context, alert console and break loading states safely
    if (!patientIdStr) {
      console.error('No valid authenticated patient identifier located. Check localStorage persistence.');
      this.isLoading = false;
      this.resourcesLoading = false;
      this.patientDetails = null; // Forces template out of true loading state if unauthenticated
      this.cdr.markForCheck();
      return;
    }

    const patientId = parseInt(patientIdStr, 10);

    // 1. Fetch Basic Profile Metrics
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient: any) => {
        this.patientDetails = patient || {};
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching patient profile metadata:', err);
        this.isLoading = false;
        this.patientDetails = {}; // Initialize empty object so template conditions unlock gracefully
        this.cdr.markForCheck();
      }
    });

    // 2. Fetch Exercises (Filtering out invisible records matching engine definitions)
    this.exerciseService.getPatientExercises(patientId).subscribe({
      next: (data: any) => {
        // Safe Check: Fallback if backend returns an Object {} map instead of an Array []
        const rawExercises = Array.isArray(data) ? data : Object.values(data || {});
        
        // Ensure only exercises where is_visible is explicitly true display to the patient dashboard
        this.exercises = rawExercises.filter((exercise: any) => exercise && exercise.is_visible === true);
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to pull assigned exercise datasets:', err);
        this.exercises = [];
        this.cdr.markForCheck();
      }
    });

    // 3. Fetch Documents with Filtering across Records, Templates, AND Visibility flags
    this.documentService.getPatientDocuments(patientId).subscribe({
      next: (data: any[]) => {
        const collection = data || [];
        
        // Filter out categorized structures based on 'Template' definitions AND verify explicit visibility is true
        this.medicalRecords = collection.filter(doc => doc.category !== 'Template' && doc.isVisible === true);
        this.medicalLetters = collection.filter(doc => doc.category === 'Template' && doc.isVisible === true);
        
        this.resourcesLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed parsing documents payload array:', err);
        this.medicalRecords = [];
        this.medicalLetters = [];
        this.resourcesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewAttachment(attachment: any): void {
    let targetUrl = attachment.url;
    if (!targetUrl) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No active resource path located for this file node.' });
      return;
    }

    if (attachment.type === 'pdf' && targetUrl.startsWith('/storage/')) {
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      targetUrl = `${baseUrl}${targetUrl}`;
    }

    if (attachment.type === 'pdf') {
      this.activePdfTitle = attachment.label || attachment.title || 'View Resource';
      this.activePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
      this.showPdfModal = true;
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    this.cdr.markForCheck();
  }

  closePdfModal(): void {
    this.showPdfModal = false;
    this.activePdfUrl = null;
    this.activePdfTitle = '';
    this.cdr.markForCheck();
  }

  // Smoothly scrolls down to specific card node anchors on demand
  scrollToSection(sectionId: string): void {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  downloadDocument(documentId: number, fileName: string): void {
    this.documentService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || `document-${documentId}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed streaming diagnostic material download from storage source:', err);
        Swal.fire({ icon: 'error', title: 'Download Failed', text: 'Unable to stream data payload from application storage.' });
      }
    });
  }
}
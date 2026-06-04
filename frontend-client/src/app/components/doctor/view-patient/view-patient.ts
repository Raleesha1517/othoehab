import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Patient } from '../../../core/services/patient';
import { Exercise } from '../../../core/services/exercise';
import { PatientDocumentService } from '../../../core/services/patient-document';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-patient.html',
  styleUrl: './view-patient.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPatient implements OnInit {
  patientDetails: any = null;
  isLoading = true;
  patientId: number | null = null;

  // Trackable Data Store Nodes
  exercises: any[] = [];
  medicalRecords: any[] = []; // Stores general patient documents (excludes 'Template')
  medicalLetters: any[] = []; // Stores documents where category === 'Template'
  resourcesLoading = true;

  // Active Document Preview Properties
  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  constructor(
    private patientService: Patient,
    private exerciseService: Exercise,
    private documentService: PatientDocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      if (this.patientId) {
        this.loadPatientDetails();
        this.loadPatientResources();
      } else {
        this.isLoading = false;
        this.resourcesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadPatientDetails(): void {
    if (!this.patientId) return;

    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.patientDetails = patient;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load patient details:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Unable to load patient details.',
          icon: 'error',
          confirmButtonColor: '#005f73'
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadPatientResources(): void {
    if (!this.patientId) return;

    // 1. Fetch allocated exercises mapped with defensive structural checks
    this.exerciseService.getPatientExercises(this.patientId).subscribe({
      next: (data: any) => {
        // Defensive fix: Convert associative objects to flat array list maps if array structure is broken
        const rawExercises = Array.isArray(data) ? data : Object.values(data || {});

        this.exercises = rawExercises.map((ex: any) => {
          if (!ex) return null;
          let visibilityState = true; // Fallback default if not defined
          
          if (ex.pivot && ex.pivot.is_visible !== undefined && ex.pivot.is_visible !== null) {
            // Evaluates truthiness for string '1', integer 1, or boolean true
            visibilityState = ex.pivot.is_visible == 1 || ex.pivot.is_visible === true || ex.pivot.is_visible === '1';
          }
          
          // Re-map both root and internal pivot parameters to match database synchronization rules
          return {
            ...ex,
            isVisible: visibilityState,
            pivot: ex.pivot ? {
              ...ex.pivot,
              is_visible: visibilityState
            } : null
          };
        }).filter(ex => ex !== null);

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load exercises:', err);
        this.exercises = [];
        this.cdr.markForCheck();
      }
    });

    // 2. Fetch documents and partition data lists securely
    this.documentService.getPatientDocuments(this.patientId).subscribe({
      next: (data: any) => {
        // Defensive fix: Fallback mapping rule ensuring iterable datasets across array conditions
        const rawDocs = Array.isArray(data) ? data : Object.values(data || {});

        const fullCollection = rawDocs.map((doc: any) => {
          if (!doc) return null;
          let visibilityState = true;
          
          if (doc.isVisible !== undefined && doc.isVisible !== null) {
            visibilityState = doc.isVisible == 1 || doc.isVisible === true || doc.isVisible === '1';
          } else if (doc.is_visible !== undefined && doc.is_visible !== null) {
            // Fallback to snake_case check if response properties vary
            visibilityState = doc.is_visible == 1 || doc.is_visible === true || doc.is_visible === '1';
          }

          return {
            ...doc,
            isVisible: visibilityState
          };
        }).filter(doc => doc !== null);
        
        // Medical Records: Filter out "Template" categorizations
        this.medicalRecords = fullCollection.filter(doc => doc.category !== 'Template');
        
        // Medical Letters: Only capture row files explicitly mapped to "Template"
        this.medicalLetters = fullCollection.filter(doc => doc.category === 'Template');

        this.resourcesLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load patient document dataset:', err);
        this.medicalRecords = [];
        this.medicalLetters = [];
        this.resourcesLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Dispatches asynchronous pipeline modifications targeting database values
   */
  toggleVisibility(item: any, type: 'exercise' | 'document'): void {
    if (!this.patientId) return;
    const nextStateValue = !item.isVisible;

    if (type === 'exercise') {
      this.exerciseService.toggleExerciseVisibility(this.patientId, item.id, nextStateValue).subscribe({
        next: () => {
          item.isVisible = nextStateValue;
          if (item.pivot) {
            item.pivot.is_visible = nextStateValue;
          }
          this.cdr.markForCheck();
        },
        error: () => this.displayToggleError()
      });
    } else {
      this.documentService.toggleDocumentVisibility(item.id, nextStateValue).subscribe({
        next: () => {
          item.isVisible = nextStateValue;
          this.cdr.markForCheck();
        },
        error: () => this.displayToggleError()
      });
    }
  }

  private displayToggleError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Database Sync Failed',
      text: 'We were unable to change visibility rules at this moment. Please refresh and try again.',
      confirmButtonColor: '#005f73'
    });
  }

  viewAttachment(attachment: any): void {
    let targetUrl = attachment.url;
    if (!targetUrl) {
      Swal.fire({ icon: 'error', title: 'Broken Target', text: 'No active path address located for this file node.' });
      return;
    }

    if (attachment.type === 'pdf' && targetUrl.startsWith('/storage/')) {
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      targetUrl = `${baseUrl}${targetUrl}`;
    }

    if (attachment.type === 'pdf') {
      this.activePdfTitle = attachment.label || attachment.title || 'Asset View';
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
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to download selected file dataset stream.' });
      }
    });
  }

  deleteDocument(documentId: number): void {
    Swal.fire({
      title: 'Delete this document resource tracking item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(documentId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Deleted', text: 'Item removed successfully.', timer: 1500, showConfirmButton: false });
            this.loadPatientResources();
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete selected data payload instance.' });
          }
        });
      }
    });
  }

  goToAllocateExercises(): void {
    if (this.patientId) this.router.navigate(['/allocate-exercise', this.patientId]);
  }

  goToAllocateTemplates(): void {
    if (this.patientId) this.router.navigate(['/allocate-template', this.patientId]);
  }

  goToAllocateDocuments(): void {
    if (this.patientId) this.router.navigate(['/allocate-documents', this.patientId]);
  }

  editPatient(): void { this.router.navigate(['/doctor-dashboard']); }
  goBack(): void { this.router.navigate(['/doctor-dashboard']); }
}
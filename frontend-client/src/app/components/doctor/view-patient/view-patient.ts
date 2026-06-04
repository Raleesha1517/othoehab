import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Patient } from '../../../core/services/patient';
import { Exercise } from '../../../core/services/exercise';
import { PatientDocumentService } from '../../../core/services/patient-document';
import { FollowupService, Followup } from '../../../core/services/followup'; 
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-patient',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './view-patient.html',
  styleUrl: './view-patient.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewPatient implements OnInit {
  patientDetails: any = null;
  isLoading = true;
  patientId: number | null = null;

  // Inline Editing Tracking States
  isEditing = false;
  editForm: any = {
    name: '',
    phone: '',
    age: null,
    email: '',
    nic_number: '',
    category: 'General',
    other_category_detail: '',
    red_flags: '',
    description: ''
  };

  // Trackable Data Store Nodes
  exercises: any[] = [];
  medicalRecords: any[] = []; 
  medicalLetters: any[] = []; 
  resourcesLoading = true;

  // Follow-up Highlight Properties
  closestPastFollowup: Followup | null = null;
  closestFutureFollowup: Followup | null = null;

  // Active Document Preview Properties
  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  constructor(
    private patientService: Patient,
    private exerciseService: Exercise,
    private documentService: PatientDocumentService,
    private followupService: FollowupService, 
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      if (this.patientId) {
        // Reset loading flags on parameter resolution reset
        this.isLoading = true;
        this.resourcesLoading = true;
        this.cdr.markForCheck();

        this.loadPatientDetails();
        this.loadPatientResources();
        this.calculateClosestFollowupDates(); 
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
        this.cdr.markForCheck(); // 💡 Tells OnPush template to explicitly update
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
        this.patientDetails = {}; // 💡 Force fallback declaration to unlock template structural directives
        this.cdr.markForCheck();
      }
    });
  }

  // Add this method inside your ViewPatient class component in view-patient.component.ts

  removeAllocatedExercise(exerciseId: number): void {
    if (!this.patientId) return;

    Swal.fire({
      title: 'Remove allocated exercise?',
      text: 'This exercise will no longer be visible on this patient\'s profile.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1'
    }).then((result) => {
      if (result.isConfirmed) {
        // 💡 Uses your exercise assignment pipeline pattern to tear down the linked node row entries
        this.exerciseService.unassignExerciseFromPatient(this.patientId!, exerciseId).subscribe({
          next: () => {
            // Remove the exercise locally from the rendering stream
            this.exercises = this.exercises.filter(ex => ex.id !== exerciseId);
            this.cdr.markForCheck();

            Swal.fire({
              icon: 'success',
              title: 'Removed',
              text: 'Exercise allocation removed cleanly.',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Failed to drop exercise allocation link mapping:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to drop exercise link mapping parameter records from backend database systems.'
            });
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  calculateClosestFollowupDates(): void {
    if (!this.patientId) return;

    this.followupService.getPatientFollowups(this.patientId).subscribe({
      next: (followups: Followup[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        let bestPast: Followup | null = null;
        let bestFuture: Followup | null = null;

        let minPastDiff = Infinity;
        let minFutureDiff = Infinity;

        // 💡 Cast the fallback collection array as Followup[] to satisfy TypeScript strict mode
        const collection = (Array.isArray(followups) ? followups : Object.values(followups || {})) as Followup[];

        collection.forEach(item => {
          // TypeScript now knows 'item' is a Followup object and allows property access safely
          if (item.followup_date) {
            const fDate = new Date(item.followup_date);
            if (fDate <= today) {
              const diff = today.getTime() - fDate.getTime();
              if (diff < minPastDiff) {
                minPastDiff = diff;
                bestPast = item;
              }
            }
          }

          if (item.next_followup_date) {
            const nDate = new Date(item.next_followup_date);
            if (nDate >= today) {
              const diff = nDate.getTime() - today.getTime();
              if (diff < minFutureDiff) {
                minFutureDiff = diff;
                bestFuture = item;
              }
            }
          }
        });

        this.closestPastFollowup = bestPast;
        this.closestFutureFollowup = bestFuture;
        this.cdr.markForCheck(); 
      },
      error: (err) => {
        console.error('Failed processing quick view headers', err);
        this.cdr.markForCheck();
      }
    });
  }

  startEditing(): void {
    if (!this.patientDetails) return;
    this.editForm = { ...this.patientDetails };
    this.isEditing = true;
    this.cdr.markForCheck();
  }

  cancelEditing(): void {
    // Correct tracking variables cleanly
    this.isEditing = false;
    this.cdr.markForCheck();
  }

  savePatientChanges(): void {
    if (!this.patientId) return;

    this.patientService.updatePatient(this.patientId, this.editForm).subscribe({
      next: (response: any) => {
        this.isEditing = false;
        this.patientDetails = { ...this.patientDetails, ...this.editForm };
        this.cdr.markForCheck();

        Swal.fire({
          title: 'Updated!',
          text: 'Patient clinical file logs updated successfully.',
          icon: 'success',
          timer: 1800,
          confirmButtonColor: '#005f73'
        });
      },
      error: (err) => {
        console.error('Failed to process modification dataset update:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Modification save error operation failure: ' + (err.message || ''),
          icon: 'error',
          confirmButtonColor: '#005f73'
        });
        this.cdr.markForCheck();
      }
    });
  }

  loadPatientResources(): void {
    if (!this.patientId) return;

    this.exerciseService.getPatientExercises(this.patientId).subscribe({
      next: (data: any) => {
        const rawExercises = Array.isArray(data) ? data : Object.values(data || {});

        this.exercises = rawExercises.map((ex: any) => {
          if (!ex) return null;
          let visibilityState = true;
          
          if (ex.pivot && ex.pivot.is_visible !== undefined && ex.pivot.is_visible !== null) {
            visibilityState = ex.pivot.is_visible == 1 || ex.pivot.is_visible === true || ex.pivot.is_visible === '1';
          }
          
          return {
            ...ex,
            isVisible: visibilityState,
            pivot: ex.pivot ? { ...ex.pivot, is_visible: visibilityState } : null
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

    this.documentService.getPatientDocuments(this.patientId).subscribe({
      next: (data: any) => {
        const rawDocs = Array.isArray(data) ? data : Object.values(data || {});

        const fullCollection = rawDocs.map((doc: any) => {
          if (!doc) return null;
          let visibilityState = true;
          
          if (doc.isVisible !== undefined && doc.isVisible !== null) {
            visibilityState = doc.isVisible == 1 || doc.isVisible === true || doc.isVisible === '1';
          } else if (doc.is_visible !== undefined && doc.is_visible !== null) {
            visibilityState = doc.is_visible == 1 || doc.is_visible === true || doc.is_visible === '1';
          }

          return { ...doc, isVisible: visibilityState };
        }).filter(doc => doc !== null);
        
        this.medicalRecords = fullCollection.filter(doc => doc.category !== 'Template');
        this.medicalLetters = fullCollection.filter(doc => doc.category === 'Template');
        this.resourcesLoading = false;
        this.cdr.markForCheck(); // 💡 Essential synchronization hook
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

  toggleVisibility(item: any, type: 'exercise' | 'document'): void {
    if (!this.patientId) return;
    const nextStateValue = !item.isVisible;

    if (type === 'exercise') {
      this.exerciseService.toggleExerciseVisibility(this.patientId, item.id, nextStateValue).subscribe({
        next: () => {
          item.isVisible = nextStateValue;
          if (item.pivot) { item.pivot.is_visible = nextStateValue; }
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
      text: 'We were unable to change visibility rules at this moment.',
      confirmButtonColor: '#005f73'
    });
    this.cdr.markForCheck();
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
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to download selected file.' });
        this.cdr.markForCheck();
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
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  goToFollowups(): void {
    if (this.patientId) this.router.navigate(['/patient-followups', this.patientId]);
  }

  goToAllocateExercises(): void { if (this.patientId) this.router.navigate(['/allocate-exercise', this.patientId]); }
  goToAllocateTemplates(): void { if (this.patientId) this.router.navigate(['/allocate-template', this.patientId]); }
  goToAllocateDocuments(): void { if (this.patientId) this.router.navigate(['/allocate-documents', this.patientId]); }
  goBack(): void { this.router.navigate(['/doctor-dashboard']); }
}
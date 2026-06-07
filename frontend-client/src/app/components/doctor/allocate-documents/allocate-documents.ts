import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientDocumentService } from '../../../core/services/patient-document';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-allocate-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './allocate-documents.html',
  styleUrl: './allocate-documents.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocateDocuments implements OnInit {
  patientId: number | null = null;
  patientDocuments: any[] = [];
  filteredDocuments: any[] = [];
  searchQuery = '';

  showDocumentUploadModal = false;
  documentFile: File | null = null;
  documentCategory = '';
  documentDescription = '';
  documentSignedStatus = 'not signed'; // Track verification values
  isUploadingDocument = false;

  documentCategories = [
    'Medical Report',
    'Assessment Form',
    'Treatment Plan',
    'Progress Notes',
    'Lab Results',
    'Imaging Report',
    'Discharge Summary',
    'Other'
  ];

  constructor(
    private documentService: PatientDocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['patientId'] ? +params['patientId'] : null;
      if (this.patientId) {
        this.loadPatientDocuments();
      } else {
        this.router.navigate(['/doctor-dashboard']);
      }
    });
  }

  loadPatientDocuments(): void {
    if (!this.patientId) return;

    this.documentService.getPatientDocuments(this.patientId).subscribe({
      next: (data: any[]) => {
        const collection = data || [];
        this.patientDocuments = collection.filter(d => d.category !== 'Template');
        this.filterPatientDocuments();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to parse patient file inventory payload mappings:', err);
      }
    });
  }

  filterPatientDocuments(): void {
    const term = this.searchQuery.toLowerCase().trim();
    if (!term) {
      this.filteredDocuments = [...this.patientDocuments];
    } else {
      this.filteredDocuments = this.patientDocuments.filter(d => {
        const cat = (d.category || '').toLowerCase();
        const desc = (d.description || '').toLowerCase();
        const title = (d.name || '').toLowerCase();
        return cat.includes(term) || desc.includes(term) || title.includes(term);
      });
    }
    this.cdr.markForCheck();
  }

  openDocumentUploadModal(): void {
    this.showDocumentUploadModal = true;
    this.documentFile = null;
    this.documentCategory = '';
    this.documentDescription = '';
    this.documentSignedStatus = 'not signed'; // Resets structural state values cleanly
    this.cdr.markForCheck();
  }

  closeDocumentUploadModal(): void {
    this.showDocumentUploadModal = false;
    this.cdr.markForCheck();
  }

  onDocumentFileSelected(event: any): void {
    this.documentFile = event.target.files?.[0] || null;
  }

  uploadDocument(): void {
    if (!this.documentFile || !this.documentCategory || !this.patientId) {
      Swal.fire({ icon: 'warning', title: 'Required Inputs Missing', text: 'Select a document file and its category group.' });
      return;
    }

    this.isUploadingDocument = true;
    this.cdr.markForCheck();

    // Appended signature status variable payload argument to your service
    this.documentService.uploadDocument(
      this.patientId,
      this.documentFile,
      this.documentCategory,
      this.documentDescription,
      this.documentSignedStatus
    ).subscribe({
      next: () => {
        this.isUploadingDocument = false;
        Swal.fire({ icon: 'success', title: 'File Uploaded', text: 'Medical profile item committed.', timer: 1500, showConfirmButton: false });
        this.closeDocumentUploadModal();
        this.loadPatientDocuments();
      },
      error: (err) => {
        this.isUploadingDocument = false;
        Swal.fire({ icon: 'error', title: 'Upload Refused', text: err?.error?.message || 'Failed to sync resource payload.' });
        this.cdr.markForCheck();
      }
    });
  }

  deletePatientFile(doc: any): void {
    if (!doc.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to permanently delete "${doc.name || 'this record'}" from the clinical system?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(doc.id).subscribe({
          next: () => {
            this.loadPatientDocuments();
            Swal.fire({ icon: 'success', title: 'Removed!', text: 'Medical record deleted successfully.', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Delete Failed', text: err?.error?.message || 'Could not clean record resource from backend dataset.' });
          }
        });
      }
    });
  }

  downloadPatientFile(doc: any): void {
    if (!doc.id) return;
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name || `medical-record-${doc.id}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire({ icon: 'error', title: 'Could not fetch file binary mapping from stream.' })
    });
  }

  goBack(): void {
    this.router.navigate(['/view-patient', this.patientId]);
  }
}
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientDocumentService } from '../../../core/services/patient-document';
import { Patient } from '../../../core/services/patient'; 
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-document-sign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-sign.html',
  styleUrl: './document-sign.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentSign implements OnInit {
  // Collection Matrix lists
  unsignedDocuments: any[] = [];
  processedDocuments: any[] = [];
  isLoading = false;

  // Modal Matrix Tracking State Structure
  showEditModal = false;
  selectedDoc: any = null;
  updatedStatus = 'not signed';
  replacementFile: File | null = null;
  isSaving = false;

  constructor(
    private documentService: PatientDocumentService,
    private patientService: Patient, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllSystemDocuments();
  }

  loadAllSystemDocuments(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    // 1. Fetch patient tracking profiles using the service wrapper (fixes 401 Unauthorized)
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        if (!patients || patients.length === 0) {
          this.unsignedDocuments = [];
          this.processedDocuments = [];
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }

        // 2. Fetch document sets concurrently across patient indexes
        const documentRequests: Observable<any[]>[] = patients.map((p: any) => 
          this.documentService.getPatientDocuments(p.id).pipe(
            // Catch errors on individual patient loops so one failure doesn't crash the whole UI
            catchError(err => {
              console.error(`Failed to pull logs for patient ID ${p.id}:`, err);
              return of([]);
            })
          )
        );

        // 🧠 Fixed: Explicitly typed forkJoin payload to match Observer signatures across modern RxJS structures
        forkJoin<Observable<any[]>[]>(documentRequests).subscribe({
          next: (results: any) => {
            let allDocs: any[] = [];
            const resultsArray = results as any[][];
            
            resultsArray.forEach((docList, index) => {
              const patientContext = patients[index];
              if (docList && Array.isArray(docList)) {
                const mappedDocs = docList.map(d => ({
                  ...d,
                  patientName: patientContext.name,
                  patientCode: patientContext.patient_code
                }));
                allDocs = [...allDocs, ...mappedDocs];
              }
            });

            // 3. SEPARATE & SORT STRATEGY:
            // "unsigned" items sorted oldest upload first (earliest timestamp listed on top)
            this.unsignedDocuments = allDocs
              .filter(d => d.signed_status === 'not signed')
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            // "processed" historical items sorted newest first
            this.processedDocuments = allDocs
              .filter(d => d.signed_status === 'signed' || d.signed_status === 'no need signed')
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Failed to parse multi-patient document matrix:', err);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: (err) => {
        console.error('Failed to load patient indices:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
        Swal.fire({ 
          icon: 'error', 
          title: 'Session Error', 
          text: 'Could not synchronize patient metrics. Please check your credentials.' 
        });
      }
    });
  }

  openEditModal(doc: any): void {
    this.selectedDoc = doc;
    this.updatedStatus = doc.signed_status;
    this.replacementFile = null;
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedDoc = null;
    this.replacementFile = null;
    this.cdr.markForCheck();
  }

  onFileSelected(event: any): void {
    this.replacementFile = event.target.files?.[0] || null;
  }

  submitDocumentUpdates(): void {
    if (!this.selectedDoc) return;

    this.isSaving = true;
    this.cdr.markForCheck();

    this.documentService.updateDocumentStatus(
      this.selectedDoc.id,
      this.updatedStatus,
      this.replacementFile || undefined
    ).subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire({ icon: 'success', title: 'Document Synced', text: 'Status update applied successfully.', timer: 1500, showConfirmButton: false });
        this.closeEditModal();
        this.loadAllSystemDocuments(); // Hot reloads grid allocations matrix layout
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({ icon: 'error', title: 'Modification Failed', text: err?.error?.message || 'The instruction set was refused.' });
        this.cdr.markForCheck();
      }
    });
  }

  downloadFile(doc: any): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch file payload streams.' })
    });
  }
}
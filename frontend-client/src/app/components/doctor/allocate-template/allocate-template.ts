import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Template } from '../../../core/services/template';
import { PatientDocumentService } from '../../../core/services/patient-document';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-allocate-template',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './allocate-template.html',
  styleUrl: './allocate-template.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocateTemplate implements OnInit {
  patientId: number | null = null;
  
  // Grid Data (Available Templates - Bottom Section)
  templates: any[] = [];
  filteredTemplates: any[] = [];
  searchTerm = '';
  selectedTemplate: any = null;

  // Table Data (Allocated Records - Top Section)
  patientDocuments: any[] = [];
  filteredDocuments: any[] = [];
  documentSearchQuery = '';

  // Modal & Upload Matrix states
  showTemplateUploadModal = false;
  uploadFile: File | null = null;
  uploadName = '';
  uploadDescription = '';
  isUploading = false;
  isAllocating = false;

  constructor(
    private templateService: Template,
    private documentService: PatientDocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['patientId'] ? +params['patientId'] : null;
      if (this.patientId) {
        this.loadTemplates();
        this.loadPatientDocuments();
      } else {
        this.router.navigate(['/doctor-dashboard']);
      }
    });
  }

  loadTemplates(): void {
    this.templateService.getClinicalTemplates().subscribe({
      next: (data) => {
        this.templates = data || [];
        this.filterTemplates();
        this.cdr.markForCheck();
      },
      error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'Could not load master templates.' })
    });
  }

  loadPatientDocuments(): void {
    if (!this.patientId) return;
    this.documentService.getPatientDocuments(this.patientId).subscribe({
      next: (data: any[]) => {
        this.patientDocuments = (data || []).filter(d => d.category === 'Template');
        this.filterPatientDocuments();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Records failed to load:', err)
    });
  }

  filterTemplates(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredTemplates = term ? this.templates.filter(t => 
      (t.name || t.title || '').toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term)
    ) : [...this.templates];
    this.cdr.markForCheck();
  }

  filterPatientDocuments(): void {
    const term = this.documentSearchQuery.toLowerCase().trim();
    this.filteredDocuments = term ? this.patientDocuments.filter(d => 
      (d.name || '').toLowerCase().includes(term) || (d.description || '').toLowerCase().includes(term)
    ) : [...this.patientDocuments];
    this.cdr.markForCheck();
  }

  selectTemplate(template: any): void {
    this.selectedTemplate = template;
    this.cdr.markForCheck();
  }

  openTemplateUploadModal(): void {
    this.showTemplateUploadModal = true;
    this.uploadFile = null;
    this.uploadName = '';
    this.uploadDescription = '';
    this.cdr.markForCheck();
  }

  closeTemplateUploadModal(): void {
    this.showTemplateUploadModal = false;
    this.cdr.markForCheck();
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.uploadFile = file;
      this.uploadName = this.uploadName || file.name.split('.')[0];
      this.cdr.markForCheck();
    }
  }

  uploadTemplateFile(): void {
    if (!this.uploadFile || !this.uploadName.trim() || !this.patientId) return;

    this.isUploading = true;
    this.documentService.uploadDocument(this.patientId, this.uploadFile, 'Template', this.uploadDescription || this.uploadName)
      .subscribe({
        next: () => {
          this.isUploading = false;
          this.closeTemplateUploadModal();
          this.loadPatientDocuments();
          Swal.fire({ icon: 'success', title: 'Document Uploaded', timer: 1500, showConfirmButton: false });
        },
        error: () => { this.isUploading = false; this.cdr.markForCheck(); }
      });
  }

  allocateTemplate(): void {
    if (!this.selectedTemplate || !this.patientId) return;
    this.isAllocating = true;
    this.templateService.assignCustomPatientTemplate(this.patientId, this.selectedTemplate.id, new File([], 'template'), 'allocated')
      .subscribe({
        next: () => {
          this.isAllocating = false;
          this.selectedTemplate = null;
          this.loadPatientDocuments();
          Swal.fire({ icon: 'success', title: 'Allocated Successfully', timer: 1500, showConfirmButton: false });
        },
        error: () => { this.isAllocating = false; this.cdr.markForCheck(); }
      });
  }

  deletePatientFile(doc: any): void {
    if (!doc.id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${doc.name || 'this document'}" from the patient's records?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => { // <-- CHANGED FROM .subscribe TO .then
      if (result.isConfirmed) {
        this.documentService.deleteDocument(doc.id).subscribe({
          next: () => {
            this.loadPatientDocuments(); // Instantly update view tracking grid matrix
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Document removed from patient record.', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            Swal.fire({ icon: 'error', title: 'Failed to Delete', text: err?.error?.message || 'The server rejected this instruction.' });
          }
        });
      }
    });
  }

  downloadTemplate(templateId: number, title: string): void {
    this.templateService.downloadTemplate(templateId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.toLowerCase().replace(/ /g, '-')}.pdf`;
      link.click();
    });
  }

  downloadPatientFile(doc: any): void {
    this.documentService.downloadDocument(doc.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name || 'template-doc';
      a.click();
    });
  }

  goBack(): void {
    this.router.navigate(['/view-patient', this.patientId]);
  }
}
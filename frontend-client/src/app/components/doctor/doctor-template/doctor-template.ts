import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Template } from '../../../core/services/template';

import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-doctor-template',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-template.html',
  styleUrl: './doctor-template.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorTemplate implements OnInit {
  // Collection Properties Arrays
  templateCollection: any[] = [];
  filteredCollection: any[] = [];
  
  // Filtering & State Variables 
  searchQuery = '';
  isLoading = true;

  constructor(
    private templateService: Template,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refreshTemplateRegistry();
  }

  refreshTemplateRegistry(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.templateService.getClinicalTemplates().subscribe({
      next: (data) => {
        this.templateCollection = data || [];
        this.filterTemplates();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to resolve template inventory mappings:', err);
        this.templateCollection = [];
        this.filteredCollection = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterTemplates(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCollection = [...this.templateCollection];
    } else {
      const criteria = this.searchQuery.toLowerCase();
      this.filteredCollection = this.templateCollection.filter(item => {
        const title = (item.name || item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        return title.includes(criteria) || desc.includes(criteria);
      });
    }
    this.cdr.markForCheck();
  }

  onWorkspaceFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    Swal.fire({
      title: 'Upload Configuration Profiles',
      html: `
        <div style="text-align: left; font-size: 0.9rem;">
          <label style="font-weight:600; display:block; margin-bottom:4px;">Template Title Name *</label>
          <input id="swal-template-name" class="swal2-input" style="margin: 0 0 15px 0; width: 100%; box-sizing: border-box;" value="${file.name.split('.')[0]}">
          
          <label style="font-weight:600; display:block; margin-bottom:4px;">Contextual Usage Description</label>
          <textarea id="swal-template-desc" class="swal2-textarea" style="margin: 0; width: 100%; box-sizing: border-box; height: 80px;" placeholder="Provide tracking notes or usage limits for this master layout structure..."></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Commit Framework File',
      confirmButtonColor: '#005f73',
      preConfirm: () => {
        const nameVal = (document.getElementById('swal-template-name') as HTMLInputElement).value;
        const descVal = (document.getElementById('swal-template-desc') as HTMLTextAreaElement).value;
        
        if (!nameVal.trim()) {
          Swal.showValidationMessage('A structural title name identification string is required!');
          return false;
        }
        return { name: nameVal, description: descVal };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.commitUpload(file, result.value.name, result.value.description);
      }
    });
  }

  private commitUpload(file: File, name: string, description: string): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.templateService.uploadTemplate(file, name, description).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: 'Template Uploaded Completely', timer: 1500, showConfirmButton: false });
        this.refreshTemplateRegistry();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Upload Denied', text: err?.error?.message || 'Payload handling failure.' });
        this.cdr.markForCheck();
      }
    });
  }

  // FIXED: Handles local environment address paths safely without breaking Office Online Engine
  viewActiveTemplate(item: any): void {
    if (!item.file_path) {
      Swal.fire({ icon: 'warning', title: 'Viewing Unresolvable', text: 'No document tracking storage path key exists on this model record.' });
      return;
    }
    
    const cleanPath = item.file_path.replace(/^\/+/, '');
    const documentAssetUrl = `${environment.apiUrl.replace('/api', '')}/${cleanPath}`;
    const isWordDoc = cleanPath.toLowerCase().endsWith('.doc') || cleanPath.toLowerCase().endsWith('.docx');

    // If running on Localhost development nodes, Microsoft cannot look into your machine
    if (isWordDoc && (documentAssetUrl.includes('localhost') || documentAssetUrl.includes('127.0.0.1'))) {
      Swal.fire({
        title: `<strong>Document Preview: ${item.name || item.title}</strong>`,
        icon: 'info',
        html: `
          <div class="local-preview-notice">
            <p>Word document previewing via live Microsoft services requires an external public URL.</p>
            <p class="sub-alert">Your file is saved securely at: <code>${cleanPath}</code></p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="ti ti-download"></i> Download Local Copy',
        cancelButtonText: 'Dismiss Panel',
        confirmButtonColor: '#005f73'
      }).then((result) => {
        if (result.isConfirmed) {
          this.downloadActiveTemplate(item.id, item.name || item.title);
        }
      });
      return;
    }

    // Default configuration strategy for production instances
    if (isWordDoc) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(documentAssetUrl)}`;
      window.open(officeViewerUrl, '_blank');
    } else {
      window.open(documentAssetUrl, '_blank');
    }
  }

  downloadActiveTemplate(templateId: number, nameTitle: string): void {
    this.templateService.downloadTemplate(templateId).subscribe({
      next: (blobData) => {
        const url = window.URL.createObjectURL(blobData);
        const a = document.createElement('a');
        a.href = url;
        const ext = blobData.type === 'application/pdf' ? '.pdf' : '.docx';
        a.download = `${nameTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire({ icon: 'error', title: 'File compilation stream failed.' })
    });
  }

  deleteActiveTemplate(templateId: number): void {
    Swal.fire({
      title: 'Purge Master Record Framework?',
      text: 'This operation eliminates the file tracking structural properties completely.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Purge Target',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.templateService.deleteTemplate(templateId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Deleted', timer: 1500, showConfirmButton: false });
            this.refreshTemplateRegistry();
          },
          error: () => Swal.fire({ icon: 'error', title: 'The data resource structure deletion was refused.' })
        });
      }
    });
  }

  getFileIconClass(titleString: string): string {
    const val = (titleString || '').toLowerCase();
    if (val.includes('.pdf')) return 'ti-file-type-pdf text-danger';
    if (val.includes('.doc')) return 'ti-file-type-docx text-primary';
    return 'ti-file-text text-secondary';
  }
}
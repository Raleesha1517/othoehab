import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Exercise } from '../../../core/services/exercise';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exercises.html',
  styleUrl: './exercises.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Exercises implements OnInit {
  exercises: any[] = [];
  filteredExercises: any[] = [];
  searchTerm: string = '';
  showCreateModal = false;
  showAttachmentModal = false;
  selectedExercise: any = null;

  // Embedded PDF view engine controllers
  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  // Form data
  newExerciseName = '';
  newExerciseDescription = '';
  
  // Attachment form data
  attachmentTitle = '';
  attachmentType = 'pdf'; // pdf, youtube, drive
  attachmentUrl = '';
  attachmentFile: File | null = null;

  constructor(
    private exerciseService: Exercise,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe({
      next: (data: any[]) => {
        // FIX: Map database 'title' property safely into 'name' so your UI layout renders it smoothly
        this.exercises = data.map(item => ({
          ...item,
          name: item.name || item.title
        }));
        this.filteredExercises = [...this.exercises];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load exercises:', err);
        Swal.fire({
          icon: 'error',
          title: 'System Tracking Error',
          text: 'Failed to synchronize backend exercise profiles.'
        });
        this.cdr.markForCheck();
      }
    });
  }

  viewAttachment(attachment: any): void {
    // 1. Read target from the explicit backend 'url' parameter
    let targetUrl = attachment.url;
    
    if (!targetUrl) {
      Swal.fire({
        icon: 'error',
        title: 'Broken Target',
        text: 'No active path address could be located for this file node.'
      });
      return;
    }

    // 2. FALLBACK CHECK: If it's a relative path from an old upload, prefix the environment API base url
    if (attachment.type === 'pdf' && targetUrl.startsWith('/storage/')) {
      // Strips '/api' or extra routes from environment.apiUrl if present, leaving the root domain
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      targetUrl = `${baseUrl}${targetUrl}`;
    }

    if (attachment.type === 'pdf') {
      // 3. FIX: Use attachment.label to map database columns cleanly
      this.activePdfTitle = attachment.label || attachment.title || 'PDF Preview';
      this.activePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
      this.showPdfModal = true;
    } else {
      // Open external links (YouTube/Drive) cleanly in another tab segment instance
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

  filterExercises(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredExercises = this.exercises;
    } else {
      this.filteredExercises = this.exercises.filter(e =>
        (e.name || '').toLowerCase().includes(term) ||
        (e.description || '').toLowerCase().includes(term)
      );
    }
    this.cdr.markForCheck();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.cdr.markForCheck();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newExerciseName = '';
    this.newExerciseDescription = '';
    this.cdr.markForCheck();
  }

  createExercise(): void {
    if (!this.newExerciseName) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing information',
        text: 'Please enter exercise identity label profile.'
      });
      return;
    }

    const exerciseData = {
      name: this.newExerciseName,
      description: this.newExerciseDescription
    };

    this.exerciseService.createExercise(exerciseData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Created Successfully',
          text: 'Exercise profile mapped successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        this.closeCreateModal();
        this.loadExercises();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Payload Rejection',
          text: err?.error?.message || 'Failed to initialize entry.'
        });
        this.cdr.markForCheck();
      }
    });
  }

  openAttachmentModal(exercise: any): void {
    this.selectedExercise = exercise;
    this.showAttachmentModal = true;
    this.attachmentTitle = '';
    this.attachmentType = 'pdf';
    this.attachmentUrl = '';
    this.attachmentFile = null;
    this.cdr.markForCheck();
  }

  closeAttachmentModal(): void {
    this.showAttachmentModal = false;
    this.selectedExercise = null;
    this.cdr.markForCheck();
  }

  onAttachmentFileSelected(event: any): void {
    this.attachmentFile = event.target.files?.[0] || null;
  }

  uploadAttachment(): void {
    if (!this.attachmentTitle) {
      Swal.fire({ icon: 'warning', title: 'Missing Title', text: 'Please enter reference asset descriptive title.' });
      return;
    }

    if (this.attachmentType === 'pdf' && !this.attachmentFile) {
      Swal.fire({ icon: 'warning', title: 'Missing binary blob', text: 'Please select valid PDF file sequence.' });
      return;
    }

    if ((this.attachmentType === 'youtube' || this.attachmentType === 'drive') && !this.attachmentUrl) {
      Swal.fire({ icon: 'warning', title: 'Missing Tracking URL', text: 'Provide resource location path address fields.' });
      return;
    }

    const attachmentData = {
      title: this.attachmentTitle,
      type: this.attachmentType,
      url_or_file: this.attachmentType === 'pdf' ? this.attachmentFile : this.attachmentUrl
    };

    this.exerciseService.uploadAttachment(this.selectedExercise.id, attachmentData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Asset Added',
          text: 'Attachment bound to exercise profile successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        this.closeAttachmentModal();
        this.loadExercises();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Mapping Crash',
          text: err?.error?.message || 'Failed to record attachment entity.'
        });
        this.cdr.markForCheck();
      }
    });
  }

  deleteAttachment(attachmentId: number): void {
    Swal.fire({
      title: 'Delete attachment reference link?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm purge',
      cancelButtonText: 'Retain file',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exerciseService.deleteAttachment(attachmentId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Removed', text: 'Attachment reference element cleanly purged.', timer: 1200, showConfirmButton: false });
            this.loadExercises();
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'Operation Rejection', text: 'Failed to release context link attachment mapping.' });
          }
        });
      }
    });
  }

  deleteExercise(exerciseId: number): void {
    Swal.fire({
      title: 'Purge entire exercise profile?',
      text: 'This actions releases all dependent patient allocation links.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clean register out',
      cancelButtonText: 'Cancel operation tracking',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1'
    }).then((result) => {
      if (result.isConfirmed) {
        this.exerciseService.deleteExercise(exerciseId).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Purge Finalized', text: 'Exercise index node wiped completely.', timer: 1500, showConfirmButton: false });
            this.loadExercises();
          },
          error: () => {
            Swal.fire({ icon: 'error', title: 'System Core Lockout', text: 'Failed to clear parent exercise element array targets.' });
          }
        });
      }
    });
  }
}


import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Exercise } from '../../../core/services/exercise';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-allocate-exercise',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './allocate-exercieses.html',
  styleUrl: './allocate-exercieses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocateExercise implements OnInit {
  patientId: number | null = null;
  exercises: any[] = [];
  filteredExercises: any[] = [];
  searchTerm = '';
  selectedExercises: Set<number> = new Set();
  isAllocating = false;

  // Embedded PDF view engine controllers
  showPdfModal = false;
  activePdfUrl: SafeResourceUrl | null = null;
  activePdfTitle = '';

  constructor(
    private exerciseService: Exercise,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer // 💡 Injected sanitizer for embedded rendering
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['patientId'] ? Number(params['patientId']) : null;
      if (this.patientId) {
        this.loadExercises();
      } else {
        this.router.navigate(['/doctor-dashboard']);
      }
    });
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe({
      next: (data: any[]) => {
        // FIX: Standardize structural properties safely to evaluate names and titles uniformly
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
          title: 'Sync Error',
          text: 'Failed to synchronize base clinical exercises data mapping.'
        });
        this.cdr.markForCheck();
      }
    });
  }

  viewAttachment(attachment: any): void {
    let targetUrl = attachment.url;
    
    if (!targetUrl) {
      Swal.fire({
        icon: 'error',
        title: 'Broken Target',
        text: 'No active resource path location parameter could be resolved.'
      });
      return;
    }

    // Prefix relative upload links using the API ecosystem root domain context safely
    if (attachment.type === 'pdf' && targetUrl.startsWith('/storage/')) {
      const baseUrl = environment.apiUrl.replace(/\/api$/, '');
      targetUrl = `${baseUrl}${targetUrl}`;
    }

    if (attachment.type === 'pdf') {
      this.activePdfTitle = attachment.label || attachment.title || 'Resource PDF View';
      this.activePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
      this.showPdfModal = true;
    } else {
      // YouTube/Drive links open cleanly outside the active session stream environment
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

  toggleExerciseSelection(exerciseId: number): void {
    if (this.selectedExercises.has(exerciseId)) {
      this.selectedExercises.delete(exerciseId);
    } else {
      this.selectedExercises.add(exerciseId);
    }
    this.cdr.markForCheck();
  }

  isExerciseSelected(exerciseId: number): boolean {
    return this.selectedExercises.has(exerciseId);
  }

  allocateExercises(): void {
    if (this.selectedExercises.size === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Select exercises',
        text: 'Please select at least one exercise to allocate'
      });
      return;
    }

    this.isAllocating = true;

    const allocations = Array.from(this.selectedExercises).map(exerciseId =>
      this.exerciseService.assignExerciseToPatient(this.patientId!, exerciseId)
    );

    Promise.all(allocations.map(obs => obs.toPromise())).then(() => {
      this.isAllocating = false;
      Swal.fire({
        icon: 'success',
        title: 'Allocated',
        text: `${this.selectedExercises.size} exercise(s) allocated successfully`,
        timer: 1500,
        showConfirmButton: false
      });
      this.cdr.markForCheck();
      setTimeout(() => {
        this.router.navigate(['/view-patient', this.patientId]);
      }, 1500);
    }).catch((err) => {
      this.isAllocating = false;
      console.error('Allocation failure:', err);
      Swal.fire({
        icon: 'error',
        title: 'Allocation Error',
        text: 'Failed to link parameters to the current target patient register profile.'
      });
      this.cdr.markForCheck();
    });
  }

  goBack(): void {
    this.router.navigate(['/view-patient', this.patientId]);
  }
}
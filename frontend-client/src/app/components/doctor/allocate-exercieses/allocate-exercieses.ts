import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Exercise } from '../../../core/services/exercise';
import Swal from 'sweetalert2';

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

  constructor(
    private exerciseService: Exercise,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['patientId'];
      if (this.patientId) {
        this.loadExercises();
      } else {
        this.router.navigate(['/doctor-dashboard']);
      }
    });
  }

  loadExercises(): void {
    this.exerciseService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
        this.filteredExercises = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load exercises:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load exercises'
        });
        this.cdr.markForCheck();
      }
    });
  }

  filterExercises(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredExercises = this.exercises;
    } else {
      this.filteredExercises = this.exercises.filter(e =>
        e.title?.toLowerCase().includes(term) ||
        e.description?.toLowerCase().includes(term)
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

    // Use forkJoin to wait for all allocations
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to allocate exercises'
      });
      this.cdr.markForCheck();
    });
  }

  goBack(): void {
    this.router.navigate(['/view-patient', this.patientId]);
  }
}

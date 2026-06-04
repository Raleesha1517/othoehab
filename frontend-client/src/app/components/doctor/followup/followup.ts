import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Followup, FollowupService } from '../../../core/services/followup';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-followup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './followup.html',
  styleUrl: './followup.css',
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class FollowupComponent implements OnInit {
  patientId!: number;
  followups: Followup[] = [];
  
  // Form State
  showForm: boolean = false;
  isEditMode: boolean = false;

  currentFollowup: Followup = {
    patient_id: 0,
    followup_date: '',
    clinical_decisions: '',
    allocated_document_name: '',
    next_followup_date: ''
  };

  constructor(
    private route: ActivatedRoute,
    private followupService: FollowupService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // 💡 Added NgZone to escape external browser thread blockages
  ) {}

  ngOnInit(): void {
    // Rely on Snapshot instantly for the initial auto-load path mapping
    const snapshotId = this.route.snapshot.params['patientId'];
    if (snapshotId) {
      this.patientId = Number(snapshotId);
      this.currentFollowup.patient_id = this.patientId;
      this.loadFollowupHistory();
    }

    // Fallback active subscription wrapped safely to ensure background crashes can't break state
    this.route.params.subscribe({
      next: (params) => {
        const idParam = params['patientId'];
        if (idParam && Number(idParam) !== this.patientId) {
          this.patientId = Number(idParam);
          this.currentFollowup.patient_id = this.patientId;
          this.loadFollowupHistory();
        }
      }
    });
  }

  loadFollowupHistory(): void {
    if (!this.patientId) return;

    // 💡 CRITICAL BYPASS FIX: We bypass Zone.js entirely for the initial call.
    // This forces the HTTP request out of the extension's broken execution chain.
    this.ngZone.runOutsideAngular(() => {
      this.followupService.getPatientFollowups(this.patientId).subscribe({
        next: (res) => {
          // Bring execution context back inside cleanly to force rendering
          this.ngZone.run(() => {
            this.followups = Array.isArray(res) ? res : Object.values(res || {});
            if (this.cdr) {
              this.cdr.detectChanges(); // Redraw UI immediately
            }
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Failed fetching follow-up records:', err);
            this.followups = []; 
            if (this.cdr) {
              this.cdr.detectChanges(); 
            }
            Swal.fire({
              title: 'Error!',
              text: 'Failed fetching follow-up history records.',
              icon: 'error',
              confirmButtonColor: '#005f73'
            });
          });
        }
      });
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.currentFollowup = {
      patient_id: this.patientId,
      followup_date: new Date().toISOString().split('T')[0],
      clinical_decisions: '',
      allocated_document_name: '',
      next_followup_date: ''
    };
    if (this.cdr) { this.cdr.detectChanges(); }
  }

  openEditModal(followup: Followup): void {
    this.isEditMode = true;
    this.showForm = true;
    this.currentFollowup = { ...followup };
    if (this.cdr) { this.cdr.detectChanges(); }
  }

  closeModal(): void {
    this.showForm = false;
    if (this.cdr) { this.cdr.detectChanges(); }
  }

  saveFollowup(): void {
    if (this.isEditMode && this.currentFollowup.id) {
      this.followupService.updateFollowup(this.currentFollowup.id, this.currentFollowup).subscribe({
        next: () => {
          this.closeModal();
          this.loadFollowupHistory(); 
          Swal.fire({
            title: 'Updated!',
            text: 'Session records successfully modified.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Modification error:', err);
          if (this.cdr) { this.cdr.detectChanges(); }
          Swal.fire({
            title: 'Failed!',
            text: 'Could not modify timeline entry data.',
            icon: 'error',
            confirmButtonColor: '#005f73'
          });
        }
      });
    } else {
      this.followupService.addFollowup(this.currentFollowup).subscribe({
        next: () => {
          this.closeModal();
          this.loadFollowupHistory(); 
          Swal.fire({
            title: 'Saved!',
            text: 'New follow-up log registered successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Creation error:', err);
          if (this.cdr) { this.cdr.detectChanges(); }
          Swal.fire({
            title: 'Failed!',
            text: 'Could not create new tracking session.',
            icon: 'error',
            confirmButtonColor: '#005f73'
          });
        }
      });
    }
  }

  deleteFollowup(id: number | undefined): void {
    if (!id) return;

    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this follow-up log!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.followupService.deleteFollowup(id).subscribe({
          next: () => {
            this.loadFollowupHistory(); 
            Swal.fire({
              title: 'Deleted!',
              text: 'The record has been permanently deleted.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Deletion error:', err);
            if (this.cdr) { this.cdr.detectChanges(); }
            Swal.fire({
              title: 'Error!',
              text: 'Deletion operation failed.',
              icon: 'error',
              confirmButtonColor: '#005f73'
            });
          }
        });
      }
    });
  }
}
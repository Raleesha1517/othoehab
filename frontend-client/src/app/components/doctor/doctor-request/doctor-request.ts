import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { RequestTracker } from '../../../core/services/request-tracker';

@Component({
  selector: 'app-doctor-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-request.html',
  styleUrl: './doctor-request.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorRequest implements OnInit {
  allRequests: any[] = [];
  isLoading = false;

  // Modal Configuration Tracking Variables
  showEvaluateModal = false;
  selectedRequest: any = null;
  updatedStatus = 'pending';
  doctorReplyText = '';
  isSaving = false;

  constructor(
    private requestService: RequestTracker,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadClinicRequests();
  }

  loadClinicRequests(): void {
    this.isLoading = true;
    this.cdr.markForCheck(); // Flag UI for upcoming structural load phase

    this.requestService.getAllRequests().subscribe({
      next: (data) => {
        // 🌟 Fix: Unpack data into a shallow cloned array to force OnPush evaluation
        this.allRequests = data ? [...data] : [];
        this.isLoading = false;
        this.cdr.markForCheck(); // Automatically hot-reloads data logs onto table body layers
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openEvaluateModal(req: any): void {
    this.selectedRequest = req;
    this.updatedStatus = req.status;
    this.doctorReplyText = req.reply || '';
    this.showEvaluateModal = true;
    this.cdr.markForCheck(); // Render popup overlay layout instantly
  }

  closeEvaluateModal(): void {
    this.showEvaluateModal = false;
    this.selectedRequest = null;
    this.doctorReplyText = '';
    this.cdr.markForCheck();
  }

  submitDoctorResolution(): void {
    if (!this.selectedRequest) return;
    this.isSaving = true;
    this.cdr.markForCheck();

    const payload = {
      status: this.updatedStatus,
      reply: this.doctorReplyText.trim() === '' ? null : this.doctorReplyText
    };

    this.requestService.updateRequestStatus(this.selectedRequest.id, payload).subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire({ 
          icon: 'success', 
          title: 'Changes Saved', 
          text: 'Patient request documentation logs have updated successfully.', 
          timer: 1500, 
          showConfirmButton: false 
        });
        this.closeEvaluateModal();
        this.loadClinicRequests(); // Hot-reloads list instantly
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
      }
    });
  }

  onDeleteRequest(id: number): void {
    Swal.fire({
      title: 'Delete Request Record?',
      text: 'This operation removes this entry entirely from patient clinical records history view grids.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Entry',
      confirmButtonColor: '#dc2626'
    }).then((result) => {
      if (result.isConfirmed) {
        this.requestService.deleteRequest(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Deleted Successfully', timer: 1200, showConfirmButton: false });
            this.loadClinicRequests(); // Reloads table grid layout with updated row counts
          }
        });
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'badge-approved';
      case 'not approved': return 'badge-rejected';
      default: return 'badge-pending';
    }
  }
}
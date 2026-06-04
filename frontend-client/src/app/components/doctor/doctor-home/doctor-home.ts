import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Patient } from '../../../core/services/patient';

@Component({
  selector: 'app-doctor-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorHome implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  searchTerm: string = '';
  showEditModal: boolean = false;

  selectedPatient: any = {
    id: null,
    name: '',
    phone: '',
    age: null,
    email: '',
    nic_number: '',
    category: 'Surgery',
    other_category_detail: '',
    red_flags: '',
    description: ''
  };

  constructor(
    private patientService: Patient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatientRecords();
  }

  // Fetch all patient listings
  loadPatientRecords(): void {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Could not populate clinical indexes:', err);
        this.cdr.markForCheck();
      }
    });
  }

  // Query search processing logic
  filterPatients(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredPatients = this.patients;
    } else {
      this.filteredPatients = this.patients.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.patient_code.toLowerCase().includes(term) ||
        (p.nic_number && p.nic_number.toLowerCase().includes(term))
      );
    }
    this.cdr.markForCheck();
  }

  // Navigate directly to the separate creation page component
  navigateToAddPatient(): void {
    this.router.navigate(['/add-patient']);
  }

  // Navigate to view patient details
  viewPatientDetails(patientId: number): void {
    this.router.navigate(['/view-patient', patientId]);
  }

  // Edit Modal mapping initializer
  openEditModal(patient: any): void {
    this.selectedPatient = { ...patient };
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  // Close edit modal
  closeEditModal(): void {
    this.showEditModal = false;
    this.cdr.markForCheck();
  }

  // Update request compilation processing sequence
  submitUpdatePatient(): void {
    this.patientService.updatePatient(this.selectedPatient.id, this.selectedPatient).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadPatientRecords();
        this.cdr.markForCheck();
        Swal.fire({
          title: 'Updated!',
          text: 'Patient medical file log modified successfully.',
          icon: 'success',
          confirmButtonColor: '#005f73'
        });
      },
      error: (err) => {
        this.cdr.markForCheck();
        Swal.fire({
          title: 'Error!',
          text: 'Modification update sequence failure: ' + err.message,
          icon: 'error',
          confirmButtonColor: '#005f73'
        });
      }
    });
  }

  // Delete operation handler customized via SweetAlert2
  deletePatientRecord(id: number): void {
    Swal.fire({
      title: 'Are you absolutely sure?',
      text: 'This operation will permanently purge this standalone patient clinical record trace file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.patientService.deletePatient(id).subscribe({
          next: () => {
            this.loadPatientRecords();
            this.cdr.markForCheck();
            Swal.fire({
              title: 'Purged!',
              text: 'The medical record trace has been dropped completely.',
              icon: 'success',
              confirmButtonColor: '#005f73'
            });
          },
          error: (err) => {
            this.cdr.markForCheck();
            Swal.fire({
              title: 'Error!',
              text: 'Failed to purge patient trace: ' + err.message,
              icon: 'error',
              confirmButtonColor: '#005f73'
            });
          }
        });
      }
    });
  }
}
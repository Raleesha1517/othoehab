import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'; // 👈 Updated Imports with ChangeDetectionStrategy
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { Patient } from '../../../core/services/patient';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // 👈 Added OnPush strategy here
})
export class Profile implements OnInit {
  // Application Data States
  currentUserData: any = null;
  doctorsList: any[] = [];
  userRole: string | null = null;
  userType: string = 'user'; // 'user' or 'patient'
  
  // UI Controls
  isEditing = false;
  isRegisterModalOpen = false;
  showPassword = false;

  // Form Controls
  profileForm!: FormGroup;
  registrationForm!: FormGroup;

  constructor(
    private authService: Auth,
    private patientService: Patient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef // 👈 Injected ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.userType = this.authService.getUserType();
    
    this.initializeForms();
    this.loadProfileDetails();
    
    if (this.userRole === 'doctor') {
      this.loadRegisteredDoctors();
    }
  }

  private initializeForms(): void {
    // Dynamic Profile Editing Form
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]],
      telephone_number: [''],
      age: [null],
      nic_number: [''],
      address: [''],
      password: [''] // Optional password replacement field
    });

    // Doctor-driven user registration modal form
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['doctor', Validators.required], // Auto default registration tracking
      age: [null],
      telephone_number: [''],
      nic_number: [''],
      address: ['']
    });
  }

  loadProfileDetails(): void {
    this.cdr.markForCheck(); // Mark profile area as resolving
    
    if (this.userType === 'patient') {
      const patientId = Number(this.authService.getPatientId());
      if (patientId) {
        this.patientService.getPatientById(patientId).subscribe({
          next: (data) => {
            this.currentUserData = data;
            this.patchProfileForm(data, true);
            this.cdr.markForCheck(); // 👈 Automatically schedules view re-render
          },
          error: () => {
            this.showNotification('error', 'Failed to load profile logs.');
            this.cdr.markForCheck();
          }
        });
      }
    } else {
      this.authService.getUser().subscribe({
        next: (data) => {
          this.currentUserData = data;
          this.patchProfileForm(data, false);
          this.cdr.markForCheck(); // 👈 Automatically schedules view re-render
        },
        error: () => {
          this.showNotification('error', 'Failed to load user system details.');
          this.cdr.markForCheck();
        }
      });
    }
  }

  private patchProfileForm(data: any, isPatient: boolean): void {
    this.profileForm.patchValue({
      name: data.name,
      email: data.email,
      telephone_number: isPatient ? data.phone : data.telephone_number,
      age: data.age,
      nic_number: data.nic_number,
      address: isPatient ? '' : data.address,
      password: ''
    });
  }

  loadRegisteredDoctors(): void {
    this.cdr.markForCheck();
    
    this.authService.getDoctors().subscribe({
      next: (list) => {
        this.doctorsList = list || [];
        this.cdr.markForCheck(); // 👈 Instantly updates user grid table without user intervention
      },
      error: () => {
        console.error('Error streaming registered doctor grids.');
        this.cdr.markForCheck();
      }
    });
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfileDetails(); 
    }
    this.cdr.markForCheck(); // 👈 Synchronize dynamic edit field buttons
  }

  saveProfileChanges(): void {
    if (this.profileForm.invalid) return;

    const formValues = { ...this.profileForm.value };
    if (!formValues.password || formValues.password.trim() === '') {
      delete formValues.password;
    }

    Swal.fire({
      title: 'Update Profile Details?',
      text: 'Are you sure you want to save these adjustments?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#005f73',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Save Details'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cdr.markForCheck();
        
        this.authService.updateProfile(formValues).subscribe({
          next: (res) => {
            this.showNotification('success', 'Profile updated successfully.');
            this.isEditing = false;
            this.loadProfileDetails();
            if (res.data?.name) localStorage.setItem('user_name', res.data.name);
            this.cdr.markForCheck(); // 👈 Redraw updated profile details
          },
          error: (err) => {
            this.showNotification('error', err?.error?.message || 'Update failed.');
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  onDoctorRegisterSubmit(): void {
    if (this.registrationForm.invalid) return;

    this.authService.register(this.registrationForm.value).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Doctor Registered!',
          text: `Account code generated: ${res.user_code}`,
          confirmButtonColor: '#005f73'
        });
        this.registrationForm.reset({ role: 'doctor' });
        this.isRegisterModalOpen = false;
        this.loadRegisteredDoctors(); // Instantly triggers table array mutation update via submethod execution
      },
      error: (err) => {
        this.showNotification('error', err?.error?.message || 'Registration failed.');
        this.cdr.markForCheck();
      }
    });
  }

  private showNotification(icon: 'success' | 'error', message: string): void {
    Swal.fire({ icon, text: message, timer: 1800, showConfirmButton: false });
    this.cdr.markForCheck(); // 👈 Redraw view bindings securely if SweetAlert disrupts layout lifecycle
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  registerForm: FormGroup;
  generatedCode: string = '';

  constructor(private fb: FormBuilder, private authService: Auth) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['patient', Validators.required],
      age: [null],
      telephone_number: [''],
      nic_number: [''],
      email: [''],
      address: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.generatedCode = res.user_code;
          this.registerForm.reset({ role: 'patient' });
          Swal.fire({
            icon: 'success',
            title: 'Registration successful',
            text: `User code: ${res.user_code}`
          });
        },
        error: (err) => {
          const serverMessage = err?.error?.message ?? 'Registration failed. Please check your input.';
          const validationErrors = err?.error?.errors;
          const errorText = validationErrors
            ? Object.values(validationErrors).flat().join(' ')
            : serverMessage;

          Swal.fire({
            icon: 'error',
            title: 'Registration failed',
            text: errorText
          });
        }
      });
    }
  }
}

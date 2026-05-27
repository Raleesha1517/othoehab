import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-logging',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './logging.html',
  styleUrl: './logging.css',
})
export class Logging {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login_identifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.access_token);
          localStorage.setItem('user_role', res.role);
          localStorage.setItem('user_name', res.name ?? '');
          localStorage.setItem('user_code', res.user_code ?? '');

          Swal.fire({
            icon: 'success',
            title: 'Login successful',
            text: `Welcome back, ${res.name || 'user'}!`,
            timer: 1600,
            showConfirmButton: false
          });

          if (res.role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else if (res.role === 'doctor') {
            this.router.navigate(['/doctor-dashboard']);
          } else if (res.role === 'hr') {
            this.router.navigate(['/hr-dashboard']);
          } else if (res.role === 'patient') {
            this.router.navigate(['/patient-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          const message = err?.error?.message || 'Authentication failed. Check login details.';
          Swal.fire({
            icon: 'error',
            title: 'Login failed',
            text: message
          });
        }
      });
    }
  }
}

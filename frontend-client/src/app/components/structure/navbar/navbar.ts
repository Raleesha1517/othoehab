import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, ReactiveFormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isMobileMenuOpen = false;

  constructor(
    public auth: Auth,
    private router: Router
  ) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

  get role(): string | null {
    return this.auth.getUserRole();
  }

  get userName(): string {
    return this.auth.getUserName();
  }

  logout() {
    Swal.fire({
      title: 'Sign out?',
      text: 'You will be returned to the login screen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, sign out',
      cancelButtonText: 'Stay',
      confirmButtonColor: '#0B1F3A',
      cancelButtonColor: '#718096',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout().subscribe({
          next: () => this.clearAndRedirect(),
          error: () => this.clearAndRedirect(),
        });
      }
    });
  }

  get homeRoute(): string {
  if (!this.isLoggedIn) return '/';
  
  switch (this.role) {
    case 'admin': return '/admin-dashboard';
    case 'doctor': return '/doctor-dashboard';
    case 'hr': return '/hr-dashboard';
    case 'patient': return '/patient-dashboard';
    default: return '/';
  }
}

  private clearAndRedirect() {
    localStorage.clear();
    Swal.fire({
      icon: 'success',
      title: 'Signed out',
      text: 'You have been logged out successfully.',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => this.router.navigate(['/']));
  }
}
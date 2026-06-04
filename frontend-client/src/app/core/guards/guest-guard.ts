import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // If user is already logged in, redirect them to their respective dashboard
  if (authService.isAuthenticated()) {
    const role = authService.getUserRole();
    
    if (role === 'admin') {
      router.navigate(['/admin-dashboard']);
    } else if (role === 'doctor') {
      router.navigate(['/doctor-dashboard']);
    } else if (role === 'hr') {
      router.navigate(['/hr-dashboard']);
    } else if (role === 'patient') {
      router.navigate(['/patient-dashboard']);
    } else {
      router.navigate(['/']); // Fallback just in case
    }
    return false;
  }

  // If not logged in, let them access the login page
  return true;
};
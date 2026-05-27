import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const userRole = auth.getUserRole();

  if (!auth.isAuthenticated() || !userRole) {
    return router.parseUrl('/');
  }

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  if (!allowedRoles.length || allowedRoles.includes(userRole)) {
    return true;
  }

  return router.parseUrl('/');
};

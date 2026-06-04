import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/');
  }

  const allowedRoles: string[] = route.data?.['roles'] ?? [];

  return auth.ensureUserRole().pipe(
    map((userRole) => {
      if (!userRole) {
        return router.parseUrl('/');
      }

      if (!allowedRoles.length || allowedRoles.includes(userRole)) {
        return true;
      }

      return router.parseUrl('/');
    })
  );
};

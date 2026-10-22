import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth as AuthService } from '../services/auht';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// src/app/guards/recipe-access.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth as AuthService } from '../services/auht';

export const recipeAccessGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const hasLocalAccess = localStorage.getItem('hasRecipeAccess') === 'true';

  const hasAccess = user?.hasRecipeAccess || hasLocalAccess;

  if (hasAccess) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
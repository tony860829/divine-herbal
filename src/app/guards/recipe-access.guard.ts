// src/app/guards/recipe-access.guard.ts
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth as AuthService } from '../services/auht';
import { isPlatformBrowser } from '@angular/common';

export const recipeAccessGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const user = authService.currentUser();
  if (isPlatformBrowser(platformId)) {
    const hasLocalAccess = localStorage.getItem('hasRecipeAccess') === 'true';
    const hasAccess = user?.hasRecipeAccess || hasLocalAccess;

    if (hasAccess) {
      return true;
    }
  }

  return router.createUrlTree(['/login']);
};

// src/app/guards/recipe-access.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth as AuthService } from '../services/auht';

export const recipeAccessGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  const hasLocalAccess = localStorage.getItem('hasRecipeAccess') === 'true';

  // Verifica tanto en la señal del estado del usuario como en localStorage
  const hasAccess = user?.hasRecipeAccess || hasLocalAccess;

  if (hasAccess) {
    return true;
  }

  // Si no ha pagado o no se ha autenticado, redirigir a la vista de Auth/Payment
  return router.createUrlTree(['/login']);
};
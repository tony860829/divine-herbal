import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth as AuthService } from '../services/auht';

export const paymentGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Como usas provideAppInitializer, para este punto el estado ya fue cargado desde el backend
  const user = authService.currentUser();
  const isAuthenticated = authService.isAuthenticated();

  // 1. Si no está autenticado -> a Login
  if (!isAuthenticated || !user) {
    return router.createUrlTree(['/login']);
  }

  // 2. Si YA pagó / ya tiene acceso -> a Remedies (no necesita pagar otra vez)
  if (user.hasRecipeAccess) {
    return router.createUrlTree(['/remedies']);
  }

  // 3. Usuario autenticado y sin acceso pagado -> Permitir entrada a /payment
  return true;
};
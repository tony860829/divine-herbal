import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../services/auht';
import { Toast } from '../services/toast';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const toastr = inject(Toast);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // ✅ En el servidor: SIEMPRE permitimos
  // El cliente se encargará de validar después de hidratar
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // ✅ En el cliente: validamos normalmente
  if (authService.isAuthenticated()) {
    return true;
  }

  authService.setReturnUrl(state.url);
  toastr.show({
    text: 'Please login first!',
    type: 'info',
  });
  router.navigate(['login']);
  return false;
};
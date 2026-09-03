import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, finalize, throwError } from 'rxjs';
import { inject, Injector } from '@angular/core';
import { Spinner } from '../services/spinner';
import { Toast } from '../services/toast';
import { Auth } from '../services/auht';
import { Router } from '@angular/router';

export function TokenInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const injector = inject(Injector);
  const toastr = inject(Toast);
  const router = inject(Router);

  const authService = injector.get(Auth);

  const myToken = authService.getToken();
  if (myToken) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${myToken}` },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.url.includes('api/User/authenticate') || req.url.includes('api/User/password')) {
        return throwError(() => error); // Let the error pass to component subscribe
      }

      let errorMsg = 'An unexpected error occurred.';

      switch (error.status) {
        case 0:
          errorMsg = 'Cannot connect to the server. Check your connection.';
          toastr.show({ text: errorMsg, type: 'danger' });
          break;
        case 401:
          errorMsg = 'Your session has expired. Please log in again.';
          toastr.show({ text: errorMsg, type: 'danger' });
          authService.logout();
          router.navigate(['authentication/login']);
          break;
        case 500:
          errorMsg = 'Internal server error (500). Please try again later.';
          toastr.show({ text: errorMsg, type: 'danger' });
          break;
        case 503:
          errorMsg = 'Server unavailable (503). It may be under maintenance.';
          toastr.show({ text: errorMsg, type: 'danger' });
          break;
        default:
          errorMsg = `Error ${error.status}: ${error.message}`;
          console.error(errorMsg);
          break;
      }

      return throwError(() => error);
    }),
  );
}

export function SpinnerInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const spinnerService = inject(Spinner);
  spinnerService.show();
  return next(req).pipe(finalize(() => spinnerService.hide()));
}

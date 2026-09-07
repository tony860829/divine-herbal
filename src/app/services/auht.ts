import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { tap, Observable, switchMap, map, of, finalize, catchError } from 'rxjs';
import { CurrentUser } from '../interfaces/currentUser';
import { isPlatformBrowser } from '@angular/common';
import { Company } from '../interfaces/company';
import { Password } from '../interfaces/password';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private URL = environment.API_URL;
  private tokenKey = environment.TOKEN;

  /* ===== Signals ===== */
  currentUser = signal<CurrentUser | null>(null);
  company = signal<Company | null>(null);
  isAuthenticated = signal<boolean>(false);
  /**
   * Se ejecuta al arrancar la app.
   * Retorna un Observable para que APP_INITIALIZER espere a la API antes de cargar las rutas.
   */
  initApp(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticated.set(false);
      return of(null);
    }

    return this.getCurrentUser().pipe(
      switchMap((user) => {
        const localAccess =
          isPlatformBrowser(this.platformId) && localStorage.getItem('hasRecipeAccess') === 'true';
        const finalAccess = user.hasRecipeAccess ?? localAccess;

        this.currentUser.set({
          ...user,
          hasRecipeAccess: finalAccess,
        });
        this.isAuthenticated.set(true);

        if (user.companies?.length) {
          return this.getCompanyById(user.companies[0].id).pipe(
            tap((company) => this.company.set(company)),
          );
        }
        return of(user);
      }),
      catchError(() => {
        // Si el token expiró o falló la petición, limpiamos la sesión
        this.logout();
        return of(null);
      }),
    );
  }

  login(data: any) {
    return this.http
      .post<any>(`${this.URL}/User/authenticate?companyToken=${this.tokenKey}`, data)
      .pipe(
        switchMap((resp) => {
          let hasAccess = false;

          if (isPlatformBrowser(this.platformId) && resp.token) {
            localStorage.setItem('token', resp.token);

            const payload = this.decodeToken(resp.token);
            hasAccess = payload?.hasRecipeAccess === true || payload?.hasRecipeAccess === 'true';
            localStorage.setItem('hasRecipeAccess', String(hasAccess));

            resp.decodedToken = payload;
            resp.hasRecipeAccess = hasAccess;
          }

          this.isAuthenticated.set(true);

          return this.getCurrentUser().pipe(
            switchMap((user) => {
              const finalAccess = resp.hasRecipeAccess ?? user.hasRecipeAccess ?? hasAccess;
              this.currentUser.set({
                ...user,
                hasRecipeAccess: finalAccess,
              });

              if (user.companies?.length) {
                return this.getCompanyById(user.companies[0].id).pipe(
                  tap((company) => {
                    this.company.set(company);
                  }),
                  map(() => resp),
                );
              }
              return of(resp);
            }),
          );
        }),
      );
  }

  decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedJson);
    } catch (e) {
      return null;
    }
  }

  updateCurrentUser(user: CurrentUser) {
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId) && user.hasRecipeAccess !== undefined) {
      localStorage.setItem('hasRecipeAccess', String(user.hasRecipeAccess));
    }
  }

  signUp(data: any) {
    return this.http.post<any>(`${this.URL}/User/register?token=${this.tokenKey}`, data);
  }

  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.URL}/User/current`);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.URL}/Company/${id}`);
  }

  getToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  changePassword(password: Password) {
    return this.http.put(`${this.URL}/User/password`, password);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('hasRecipeAccess');
      this.currentUser.set(null);
      this.company.set(null);
      this.isAuthenticated.set(false);
    }
  }
}

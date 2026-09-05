import { HttpClient } from '@angular/common/http';
import {
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
  EnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { environment } from '../../environments/environment';
import { tap, Observable } from 'rxjs';
import { CurrentUser } from '../interfaces/currentUser';
import { isPlatformBrowser } from '@angular/common';
import { Company } from '../interfaces/company';
import { Password } from '../interfaces/password';
import { Cart } from './cart';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private _injector = inject(EnvironmentInjector);
  private URL = environment.API_URL;
  private tokenKey = environment.TOKEN;

  currentUser = signal<CurrentUser | null>(null);
  company = signal<Company | null>(null);
  isAuthenticated = signal<boolean>(false);
  returnUrl = signal<string | null>(null);

  private initialized = false;

  setReturnUrl(url: string) {
    this.returnUrl.set(url);
  }

  clearReturnUrl() {
    this.returnUrl.set(null);
  }

  /** Extrae y decodifica las claims directamente desde el payload del JWT */
  decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodedJson);
    } catch (e) {
      return null;
    }
  }

  /** Actualiza la señal de usuario y guarda el acceso a recetas en localStorage */
  updateCurrentUser(user: CurrentUser) {
    this.currentUser.set(user);
    if (isPlatformBrowser(this.platformId) && user.hasRecipeAccess !== undefined) {
      localStorage.setItem('hasRecipeAccess', String(user.hasRecipeAccess));
    }
  }

  /** Inicialización lazy para evitar dependencias circulares al cargar la app */
  initApp() {
    if (this.initialized) return;
    this.initialized = true;

    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);

      const payload = this.decodeToken(token);
      const tokenRecipeAccess = payload?.hasRecipeAccess === true || payload?.hasRecipeAccess === 'true';
      const localAccess = isPlatformBrowser(this.platformId) && localStorage.getItem('hasRecipeAccess') === 'true';
      const hasRecipeAccess = tokenRecipeAccess || localAccess;

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('hasRecipeAccess', String(hasRecipeAccess));
      }

      this.getCurrentUser().subscribe((user) => {
        this.currentUser.set({
          ...user,
          hasRecipeAccess: user.hasRecipeAccess ?? hasRecipeAccess,
        });

        if (user.companies?.length) {
          this.getCompanyById(user.companies[0].id).subscribe((company) => {
            this.company.set(company);
          });
        }
      });
    } else {
      return runInInjectionContext(this._injector, () => {
        const cartService = inject(Cart);
        cartService.refreshCart();
      });
    }
  }

  login(data: any) {
    return this.http
      .post<any>(
        `${this.URL}/User/authenticate?companyToken=${this.tokenKey}`,
        data
      )
      .pipe(
        tap((resp) => {
          let hasAccess = false;

          if (isPlatformBrowser(this.platformId) && resp.token) {
            localStorage.setItem('token', resp.token);

            const payload = this.decodeToken(resp.token);
            hasAccess = payload?.hasRecipeAccess === true || payload?.hasRecipeAccess === 'true';

            localStorage.setItem('hasRecipeAccess', String(hasAccess));

            resp.decodedToken = payload;
            resp.hasRecipeAccess = hasAccess;
          }

          this.initialized = false;
          this.isAuthenticated.set(true);

          this.getCurrentUser().subscribe((user) => {
            const finalAccess = resp.hasRecipeAccess ?? user.hasRecipeAccess ?? hasAccess;
            this.currentUser.set({
              ...user,
              hasRecipeAccess: finalAccess,
            });

            if (user.companies?.length) {
              this.getCompanyById(user.companies[0].id).subscribe((company) => {
                this.company.set(company);
              });
            }
          });
        })
      );
  }

  signUp(data: any) {
    return this.http.post<any>(
      `${this.URL}/User/register?token=${this.tokenKey}`,
      data
    );
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
      this.initialized = false;
    }
  }
}
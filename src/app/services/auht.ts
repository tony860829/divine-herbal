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

  setReturnUrl(url: string) {
    this.returnUrl.set(url);
  }

  clearReturnUrl() {
    this.returnUrl.set(null);
  }

  private initialized = false;

  /** Lazy init to avoid circular dependency */
  initApp() {
    if (this.initialized) return;
    this.initialized = true;

    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      this.getCurrentUser().subscribe((user) => {
        this.currentUser.set(user);

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
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', resp.token);
          }

          this.initialized = false;
          this.isAuthenticated.set(true);

          this.getCurrentUser().subscribe((user) => {
            this.currentUser.set(user);

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
      this.currentUser.set(null);
      this.company.set(null);
      this.isAuthenticated.set(false);
      this.initialized = false;
    }
  }
}

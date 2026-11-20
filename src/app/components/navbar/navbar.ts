import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { translatorWidget, TranslatorWidgetLayout } from 'google-translate-widget';
import { Auth as AuthService } from '../../services/auht';
import { Translation } from '../../services/translation';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="container navbar-inner">
        <a routerLink="/" class="logo">
          <img src="images/logo.webp" alt="Divine Herbal Remedies" class="logo-icon" />
        </a>

        <nav class="nav-desktop">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
            >Home</a
          >
          <a routerLink="/remedies" routerLinkActive="active">Remedies</a>
          <a routerLink="/contact" routerLinkActive="active">Contact</a>
        </nav>

        <div class="nav-actions">
          <button class="icon-btn" (click)="toggleSearch()" [class.active]="searchOpen()" aria-label="Search">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <!-- Si el usuario está autenticado -->
          @if (authService.isAuthenticated()) {
            <div class="user-menu">
              <a routerLink="/profile" class="user-badge" title="{{ authService.currentUser()?.firstName }}">
                <span class="user-avatar">
                  {{ authService.currentUser()?.firstName?.charAt(0) || 'U' }}
                </span>
                <span class="user-name">
                  {{ authService.currentUser()?.firstName }}
                </span>
              </a>
              <button
                class="icon-btn logout-btn"
                (click)="logout()"
                title="Logout"
                aria-label="Logout"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          } @else {
            <!-- Si no está autenticado -->
            <button routerLink="/login" class="icon-btn" aria-label="Account">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button class="icon-btn" aria-label="Cart" routerLink="/payment">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </button>
          }

          <div class="translate-control notranslate">
            <div id="translate-widget" class="ml-4"></div>
          </div>

          <button class="menu-toggle" (click)="toggleMenu()" aria-label="Menu">
            @if (menuOpen()) {
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            } @else {
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M4 12h16" />
                <path d="M4 18h16" />
                <path d="M4 6h16" />
              </svg>
            }
          </button>
        </div>
      </div>

      @if (searchOpen()) {
        <div class="nav-search">
          <div class="container">
            <div class="nav-search-box">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                #searchInput
                type="search"
                [value]="searchTerm()"
                (input)="onSearchInput($event)"
                (keydown.enter)="submitSearch()"
                (keydown.escape)="closeSearch()"
                placeholder="Search natural remedies..."
                aria-label="Search remedies"
              />
              <button type="button" class="nav-search-btn" (click)="submitSearch()">Search</button>
            </div>
          </div>
        </div>
      }

      @if (menuOpen()) {
        <nav class="nav-mobile">
          <a
            routerLink="/"
            (click)="closeMenu()"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Home</a
          >
          <a routerLink="/remedies" (click)="closeMenu()" routerLinkActive="active">Remedies</a>
          <a routerLink="/contact" (click)="closeMenu()" routerLinkActive="active">Contact</a>
          @if (authService.isAuthenticated()) {
            <a routerLink="/profile" (click)="closeMenu()">My Profile</a>
          }

          @if (authService.isAuthenticated()) {
            <div class="nav-mobile-user">
              <span
                >Logged in as <strong>{{ authService.currentUser()?.firstName }}</strong></span
              >
              <button class="logout-mobile-btn" (click)="logout()">Logout</button>
            </div>
          }
        </nav>
      }
    </header>
  `,
  styleUrls: ['./navbar.scss'],
})
export class Navbar implements AfterViewInit {
  authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private translation = inject(Translation);
  private translatorInitialized = false;
  private translatorInitializationScheduled = false;

  menuOpen = signal(false);
  searchOpen = signal(false);
  searchTerm = signal('');

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.router.navigated) {
      this.scheduleTranslatorInitialization();
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.translatorInitialized) {
          this.translation.refresh();
          return;
        }

        this.scheduleTranslatorInitialization();
      });
  }

  private scheduleTranslatorInitialization(): void {
    if (this.translatorInitializationScheduled) {
      return;
    }

    this.translatorInitializationScheduled = true;
    setTimeout(() => {
      this.translatorInitializationScheduled = false;

      if (this.translatorInitialized || this.destroyRef.destroyed) {
        return;
      }

      translatorWidget({
        element: 'translate-widget',
        includedLanguages: ['en', 'es'],
        defaultLanguage: 'en',
        layout: TranslatorWidgetLayout.SIMPLE,
      });
      this.translatorInitialized = true;
    });
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
    if (this.searchOpen()) {
      setTimeout(() => this.searchInput?.nativeElement.focus(), 50);
    }
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  submitSearch(): void {
    const term = this.searchTerm().trim();
    if (!term) {
      this.searchInput?.nativeElement.focus();
      return;
    }
    this.closeSearch();
    this.closeMenu();
    this.router.navigate(['/remedies'], { queryParams: { search: term } });
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}

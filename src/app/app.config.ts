import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  InMemoryScrollingOptions,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { SpinnerInterceptor, TokenInterceptor } from './interceptors/interceptor';
import { Auth } from './services/auht';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

export function initializeApp(authService: Auth) {
  return () => authService.initApp();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling(scrollConfig)),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([TokenInterceptor, SpinnerInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(Auth);
      return authService.initApp();
    }),
  ],
};

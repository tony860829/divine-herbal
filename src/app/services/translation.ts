import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import type { TranslatorWidget } from 'google-translate-widget';

@Injectable({
  providedIn: 'root',
})
export class Translation {
  private platformId = inject(PLATFORM_ID);
  private refreshTimer?: ReturnType<typeof setTimeout>;

  refresh(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      const translator: TranslatorWidget | undefined = window.translator;

      if (translator?.getCurrentLanguage() === 'es') {
        translator.translateTo('es');
      }
    }, 300);
  }
}

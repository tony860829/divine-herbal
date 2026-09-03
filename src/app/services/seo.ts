import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  canonical?: string;
  lang?: 'es' | 'en';
  noIndex?: boolean;
  jsonLd?: object | object[];
}

@Injectable({
  providedIn: 'root'
})
export class Seo {

  private meta = inject(Meta);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);

  private readonly defaultOgImage = 'https://pckfood.com/images/og-default.jpg';
  private readonly siteUrl = 'https://pckfood.com';

  updateMetaTags(title: string, description: string, extra?: Partial<SeoData>) {
    const config: SeoData = { title, description, ...extra };

    this.titleService.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });
    
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    const robotsContent = config.noIndex ? 'noindex, nofollow' : 'index, follow';
    this.meta.updateTag({ name: 'robots', content: robotsContent });

    this.meta.updateTag({ property: 'og:title', content: config.ogTitle || config.title });
    this.meta.updateTag({ property: 'og:description', content: config.ogDescription || config.description });
    this.meta.updateTag({ property: 'og:type', content: config.ogType || 'website' });
    this.meta.updateTag({ property: 'og:url', content: config.ogUrl || this.getCurrentUrl() });
    this.meta.updateTag({ property: 'og:image', content: config.ogImage || this.defaultOgImage });
    this.meta.updateTag({ property: 'og:site_name', content: "Puris' Cuban Kitchen" });
    this.meta.updateTag({ property: 'og:locale', content: config.lang === 'es' ? 'es_ES' : 'en_US' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: config.ogTitle || config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.ogDescription || config.description });
    this.meta.updateTag({ name: 'twitter:image', content: config.ogImage || this.defaultOgImage });

    if (isPlatformBrowser(this.platformId)) {
      this.setCanonical(config.canonical || config.ogUrl || this.getCurrentUrl());
      this.removeHreflang();
      this.doc.documentElement.lang = config.lang || 'en';
    }

    if (config.jsonLd) {
      this.setJsonLd(config.jsonLd);
    } else {
      this.removeJsonLd();
    }
  }

  /**
   * Para páginas privadas: noindex pero con OG para compartir/previews
   */
  setPrivatePageMeta(title: string, description: string, extra?: Partial<SeoData>) {
    this.updateMetaTags(title, description, {
      ...extra,
      noIndex: true,
      ogType: 'website'
    });
  }

  setBasicMeta(title: string, description: string) {
    this.updateMetaTags(title, description);
  }

  clearMetaTags() {
    this.titleService.setTitle("Puris' Cuban Kitchen");
    this.meta.removeTag('name="description"');
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="robots"');
    this.meta.removeTag('property="og:title"');
    this.meta.removeTag('property="og:description"');
    this.meta.removeTag('property="og:type"');
    this.meta.removeTag('property="og:url"');
    this.meta.removeTag('property="og:image"');
    this.meta.removeTag('property="og:locale"');
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');
    
    if (isPlatformBrowser(this.platformId)) {
      this.doc.querySelector('link[rel="canonical"]')?.remove();
      this.removeHreflang();
      this.removeJsonLd();
      this.doc.documentElement.lang = 'en';
    }
  }

  private getCurrentUrl(): string {
    if (isPlatformBrowser(this.platformId)) {
      return window.location.href.split('?')[0];
    }
    return this.siteUrl;
  }

  private setCanonical(url: string) {
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private removeHreflang() {
    this.doc.querySelectorAll('link[rel="alternate"]').forEach(el => el.remove());
  }

  private setJsonLd(data: object | object[]) {
    this.removeJsonLd();
    const script = this.doc.createElement('script');
    script.setAttribute('id', 'json-ld');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }

  private removeJsonLd() {
    this.doc.getElementById('json-ld')?.remove();
  }
}
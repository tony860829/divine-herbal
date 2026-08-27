import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-categories',
  standalone: true,
  template: `
    <section class="page-section">
      <div class="container">
        <h1 class="page-title">Categories</h1>
        <p class="page-desc">Browse remedies by category. This page is under construction.</p>
      </div>
    </section>
  `,
  styles: [`
    .page-section { padding: 6rem 0 4rem; min-height: 60vh; }
    .page-title { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-primary-dark); margin-bottom: 1rem; }
    .page-desc { color: var(--color-text-light); font-size: 1.1rem; }
  `]
})
export class Categories {
   private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Categories | Divine Herbal Remedies');
    
    this.meta.updateTag({ name: 'description', content: 'Browse natural remedies by category. Find herbal solutions for digestion, respiratory health, skin care, and strengthening your immune defenses.' });
    this.meta.updateTag({ name: 'keywords', content: 'herbal categories, digestion remedies, respiratory remedies, skin care natural, immune system herbs, natural health categories' });
    this.meta.updateTag({ property: 'og:title', content: 'Categories | Divine Herbal Remedies' });
    this.meta.updateTag({ property: 'og:description', content: 'Browse natural remedies by category: digestion, respiratory system, skin care, and immune defenses.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://divineherbalremedies.com/categories' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }
}
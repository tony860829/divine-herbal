import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-remedies',
  standalone: true,
  template: `
    <section class="page-section">
      <div class="container">
        <h1 class="page-title">Remedies</h1>
        <p class="page-desc">Explore all our natural remedies. This page is under construction.</p>
      </div>
    </section>
  `,
  styles: [`
    .page-section { padding: 6rem 0 4rem; min-height: 60vh; }
    .page-title { font-family: var(--font-heading); font-size: 2.5rem; color: var(--color-primary-dark); margin-bottom: 1rem; }
    .page-desc { color: var(--color-text-light); font-size: 1.1rem; }
  `]
})
export class Remedies {
   private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Natural Remedies | Divine Herbal Remedies');
    
    this.meta.updateTag({ name: 'description', content: 'Explore our complete collection of natural herbal remedies. Honey and lemon, aloe vera, chamomile, ginger, and more natural solutions for your health.' });
    this.meta.updateTag({ name: 'keywords', content: 'natural remedies, herbal medicine, honey lemon, aloe vera, chamomile tea, ginger remedy, natural health' });
    this.meta.updateTag({ property: 'og:title', content: 'Natural Remedies | Divine Herbal Remedies' });
    this.meta.updateTag({ property: 'og:description', content: 'Explore our complete collection of natural herbal remedies made from plants, fruits, and spices for your daily well-being.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://divineherbalremedies.com/remedies' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }
}
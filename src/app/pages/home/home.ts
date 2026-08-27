import { Component, inject } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { Features } from '../../components/features/features';
import { PopularRemedies } from '../../components/popular-remedies/popular-remedies';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { Categories } from '../../components/categories/categories';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Hero,
    Features,
    PopularRemedies,
    HowItWorks,
    Categories
  ],
  template: `
    <app-hero />
    <app-features />
    <app-popular-remedies />
    <app-how-it-works />
    <app-categories />
  `
})
export class Home {
   private meta = inject(Meta);
  private title = inject(Title);

  ngOnInit(): void {
    this.title.setTitle('Divine Herbal Remedies | Natural Healing & Faith');
    
    this.meta.updateTag({ name: 'description', content: 'Discover pure herbal remedies crafted by nature to restore balance. Natural ingredients, traditional wisdom and comprehensive well-being for your daily life.' });
    this.meta.updateTag({ name: 'keywords', content: 'herbal remedies, natural medicine, organic wellness, nature heals, traditional wisdom, natural ingredients' });
    this.meta.updateTag({ property: 'og:title', content: 'Divine Herbal Remedies | Natural Healing & Faith' });
    this.meta.updateTag({ property: 'og:description', content: 'Discover pure herbal remedies crafted by nature to restore balance. Renew your body and uplift your spirit with natural ingredients.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://divineherbalremedies.com' });
    this.meta.updateTag({ property: 'og:image', content: 'https://divineherbalremedies.com/images/hero-banner.webp' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'canonical', content: 'https://divineherbalremedies.com' });
  }
}
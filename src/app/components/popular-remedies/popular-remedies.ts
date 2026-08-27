import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Remedy {
  name: string;
  description: string;
  image: string;
  slug: string;
}

@Component({
  selector: 'app-popular-remedies',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="popular" aria-labelledby="popular-title">
      <div class="container">
        <div class="section-header">
          <h2 id="popular-title" class="section-title">
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
            Most Popular Remedies
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
          </h2>
        </div>

        <div class="remedies-grid">
          @for (remedy of remedies(); track remedy.slug) {
            <article class="remedy-card">
              <div class="remedy-image">
                <img [src]="remedy.image" [alt]="remedy.name" loading="lazy" />
              </div>
              <div class="remedy-body">
                <h3>{{ remedy.name }}</h3>
                <p>{{ remedy.description }}</p>
                <a [routerLink]="['/remedies', remedy.slug]" class="remedy-link">
                  Learn more
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./popular-remedies.scss']
})
export class PopularRemedies {
  remedies = signal<Remedy[]>([
    {
      name: 'Honey and Lemon',
      description: 'Ideal for relieving throat discomfort.',
      image: 'images/honey-lemon.webp',
      slug: 'honey-and-lemon'
    },
    {
      name: 'Aloe Vera',
      description: 'Known for promoting skin care.',
      image: 'images/aloe-vera.webp',
      slug: 'aloe-vera'
    },
    {
      name: 'Manzanilla',
      description: 'Traditional infusion to promote relaxation.',
      image: 'images/manzanilla.webp',
      slug: 'manzanilla'
    },
    {
      name: 'Ginger',
      description: 'Widely used in hot drinks.',
      image: 'images/ginger.webp',
      slug: 'ginger'
    },
    {
      name: 'Lemon',
      description: 'Natural source of vitamin C.',
      image: 'images/lemon.webp',
      slug: 'lemon'
    },
    {
      name: 'Spearmint',
      description: 'Widely used for digestive infusions.',
      image: 'images/spearmint.webp',
      slug: 'spearmint'
    }
  ]);
}
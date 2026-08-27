import { Component, signal } from '@angular/core';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  template: `
    <section class="features" aria-labelledby="features-title">
      <div class="container">
        <div class="section-header">
          <h2 id="features-title" class="section-title">
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
            Why Divine Herbal Remedies?
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
          </h2>
        </div>

        <div class="features-grid">
          @for (feature of features(); track feature.title) {
            <article class="feature-card">
              <div class="feature-icon">
                <img [src]="feature.icon" [alt]="feature.title" />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./features.scss']
})
export class Features {
  features = signal<Feature[]>([
    {
      icon: 'images/icon-leaf.webp',
      title: 'Natural Ingredients',
      description: 'We use only remedies made from plants, fruits, spices, and natural products.'
    },
    {
      icon: 'images/icon-book.webp',
      title: 'Traditional Wisdom',
      description: 'We rescue ancestral knowledge combined with modern information about wellness.'
    },
    {
      icon: 'images/icon-heart-hand.webp',
      title: 'Comprehensive Well Being',
      description: 'Our goal is to help you improve your quality of life through natural habits.'
    }
  ]);
}
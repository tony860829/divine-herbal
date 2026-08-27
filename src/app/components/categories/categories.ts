import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Category {
  name: string;
  image: string;
  icon: string;
  slug: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="categories" aria-labelledby="cat-title">
      <div class="container">
        <div class="section-header">
          <h2 id="cat-title" class="section-title">
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
            Categories
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
          </h2>
        </div>

        <div class="categories-grid">
          @for (category of categories(); track category.slug) {
            <a [routerLink]="['/categories', category.slug]" class="category-card">
              <div class="category-image">
                <img [src]="category.image" [alt]="category.name" loading="lazy" />
                <div class="category-overlay"></div>
              </div>
              <div class="category-content">
                <img [src]="category.icon" [alt]="" class="category-icon" aria-hidden="true" />
                <span class="category-name">{{ category.name }}</span>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./categories.scss']
})
export class Categories {
  categories = signal<Category[]>([
    {
      name: 'Digestion',
      image: 'images/digestion.webp',
      icon: 'images/icon-stomach.webp',
      slug: 'digestion'
    },
    {
      name: 'Respiratory system',
      image: 'images/respiratory.webp',
      icon: 'images/icon-lungs.webp',
      slug: 'respiratory'
    },
    {
      name: 'Skin Care',
      image: 'images/skin-care.webp',
      icon: 'images/icon-skin.webp',
      slug: 'skin-care'
    },
    {
      name: 'Strengthen defenses',
      image: 'images/defenses.webp',
      icon: 'images/icon-shield.webp',
      slug: 'strengthen-defenses'
    }
  ]);
}
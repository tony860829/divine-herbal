import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero" role="banner">
      <div class="hero-bg">
        <img src="images/hero-banner.webp" alt="Natural herbal tea with mountain view and faith" />
        <div class="hero-overlay"></div>
      </div>
      <div class="container hero-content">
        <div class="hero-text">
          <h1>
            <span class="line1">Nature Heals</span>
            <span class="line2">Faith Restores</span>
          </h1>
          <p class="hero-desc">
            Pure Herbal Remedies crafted by Nature to restore Balance. 
            Renew your body and uplift your SPIRIT.
          </p>
          <a routerLink="/remedies" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,13,11,9,17,8Z"/>
            </svg>
            Explore Natural Remedies
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./hero.scss']
})
export class Hero {}
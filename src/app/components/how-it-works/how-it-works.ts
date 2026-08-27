import { Component, signal } from '@angular/core';

interface Step {
  number: string;
  title: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  template: `
    <section class="how-it-works" aria-labelledby="hiw-title">
      <div class="container">
        <div class="section-header">
          <h2 id="hiw-title" class="section-title">
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
            How does it work?
            <img src="images/icon-herbal.webp" alt="" class="leaf-icon" aria-hidden="true" />
          </h2>
        </div>

        <div class="steps">
          <!-- Step 1 -->
          <div class="step">
            <div class="step-badge">1</div>
            <div class="step-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8fbc6e"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p class="step-title">Search for a symptom.</p>
          </div>
          <div class="step-arrow" aria-hidden="true">&gt;</div>

          <!-- Step 2 -->
          <div class="step">
            <div class="step-badge">2</div>
            <div class="step-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8fbc6e"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,13,11,9,17,8Z"
                />
              </svg>
            </div>

            <p class="step-title">Find a remedy.</p>
          </div>
          <div class="step-arrow" aria-hidden="true">&gt;</div>

          <!-- Step 3 -->
          <div class="step">
            <div class="step-badge">3</div>
            <div class="step-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8fbc6e"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            </div>
            <p class="step-title">Read the preparation.</p>
          </div>
          <div class="step-arrow" aria-hidden="true">&gt;</div>

          <!-- Step 4 -->
          <div class="step">
            <div class="step-badge">4</div>
            <div class="step-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8fbc6e"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" x2="6.01" y1="2" y2="2" />
                <line x1="10" x2="10.01" y1="2" y2="2" />
                <line x1="14" x2="14.01" y1="2" y2="2" />
              </svg>
            </div>
            <p class="step-title">Put it into practice.</p>
          </div>
          <div class="step-arrow" aria-hidden="true">&gt;</div>

          <!-- Step 5 -->
          <div class="step">
            <div class="step-badge">5</div>
            <div class="step-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8fbc6e"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p class="step-title">Share your experience.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./how-it-works.scss'],
})
export class HowItWorks {}

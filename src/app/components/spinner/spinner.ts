import { Component, inject } from '@angular/core';
import { Spinner as SpinnerService } from '../../services/spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    @if (isLoading()) {
      <div class="spinner-wrapper">
        <div class="spinner-content">
          <div class="spinner-ring"></div>
          <div class="spinner-text">Loading...</div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .spinner-wrapper {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background: rgba(17, 17, 17, 0.85);
        backdrop-filter: blur(4px);
        z-index: 9998;
      }

      .spinner-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }

      .spinner-ring {
        width: 60px;
        height: 60px;
        border: 4px solid #ffd600;
        border-top-color: var(--color-dark);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .spinner-text {
        color: var(--color-text-light);
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class Spinner {
  private readonly spinnerService = inject(SpinnerService);
  isLoading = this.spinnerService.isLoading;
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast as ToastService } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.message(); track toast.id) {
        <div
          class="toast-item"
          [class.toast-success]="toast.type === 'success'"
          [class.toast-danger]="toast.type === 'danger'"
          [class.toast-warning]="toast.type === 'warning'"
          [class.toast-info]="toast.type === 'info'"
        >
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg viewBox="0 0 512 512" fill="currentColor" width="22" height="22">
                  <path
                    d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"
                  />
                </svg>
              }
              @case ('danger') {
                <svg viewBox="0 0 512 512" fill="currentColor" width="22" height="22">
                  <path
                    d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"
                  />
                </svg>
              }
              @case ('warning') {
                <svg viewBox="0 0 576 512" fill="currentColor" width="22" height="22">
                  <path
                    d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"
                  />
                </svg>
              }
              @default {
                <svg viewBox="0 0 512 512" fill="currentColor" width="22" height="22">
                  <path
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"
                  />
                </svg>
              }
            }
          </div>
          <div class="toast-body">
            {{ toast.text }}
          </div>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.dismiss(toast)"
            aria-label="Close"
          >
            <svg viewBox="0 0 352 512" fill="currentColor" width="14" height="14">
              <path
                d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
              />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
        max-width: 400px;
        width: 100%;
      }

      .toast-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 20px;
        border-radius: 12px;
        background: var(--color-dark, #1a1a1a);
        border: 1px solid #c6bdbd;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        pointer-events: auto;
        animation:
          slideIn 0.3s ease,
          fadeIn 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .toast-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }

      .toast-success {
        border-color: rgba(40, 167, 69, 0.3);
      }
      .toast-success::before {
        background: var(--green, #28a745);
      }
      .toast-success .toast-icon {
        color: var(--green, #28a745);
      }

      .toast-danger {
        border-color: rgba(220, 53, 69, 0.3);
      }
      .toast-danger::before {
        background: var(--red, #dc3545);
      }
      .toast-danger .toast-icon {
        color: var(--red, #dc3545);
      }

      .toast-warning {
        border-color: rgba(255, 193, 7, 0.3);
      }
      .toast-warning::before {
        background: var(--primary, #ffc107);
      }
      .toast-warning .toast-icon {
        color: var(--primary, #ffc107);
      }

      .toast-info {
        border-color: rgba(0, 123, 255, 0.3);
      }
      .toast-info::before {
        background: var(--blue, #007bff);
      }
      .toast-info .toast-icon {
        color: var(--blue, #007bff);
      }

      .toast-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }

      .toast-body {
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        color: var(--white, #fff);
        line-height: 1.5;
      }

      .toast-close {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        padding: 4px;
        transition: color 0.2s;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-close:hover {
        color: var(--white, #fff);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @media (max-width: 640px) {
        .toast-container {
          top: 80px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .toast-item {
          padding: 14px 16px;
        }
      }
    `,
  ],
})
export class Toast {
  toastService = inject(ToastService);
}

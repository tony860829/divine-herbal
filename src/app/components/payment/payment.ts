import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  signal,
  effect,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Auth as AuthService } from '../../services/auht';
import { Toast as ToastService } from '../../services/toast';
import { Spinner as SpinnerService } from '../../services/spinner';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
})
export class Payment implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastr = inject(ToastService);
  private spinnerService = inject(SpinnerService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isProcessing = signal(false);

  /* ===== Stripe ===== */
  @ViewChild('cardElement') cardElement!: ElementRef<HTMLDivElement>;
  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  clientSecret = '';
  errorMessage = '';
  isCardComplete = false;
  private stripeInitialized = false;

  /* ===== Signals del servicio ===== */
  currentUser = this.authService.currentUser;
  currentCompany = this.authService.company;

  constructor() {
    /*
      Como provideAppInitializer resuelve el usuario ANTES de cargar la ruta:
      - currentUser() y currentCompany() ya tienen valor al entrar.
    */
    effect(() => {
      const user = this.currentUser();
      const company = this.currentCompany();

      /* Inicializar Stripe una sola vez si existen los datos */
      if (user && company?.stripeAccountId && !this.stripeInitialized) {
        this.initStripeCard();
      }
    });
  }

  ngOnInit() {
    /* Si no hay token guardado, redirigir a login */
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
      return;
    }

    /* Mostrar spinner mientras Stripe termina de montarse */
    if (!this.stripeInitialized) {
      this.spinnerService.show();
    }
  }

  async initStripeCard() {
    if (this.stripeInitialized) return;

    this.errorMessage = '';
    const company = this.currentCompany();

    if (!company?.id || !company?.stripeAccountId) {
      this.spinnerService.hide();
      this.toastr.show({
        text: 'Payment configuration missing.',
        type: 'danger',
      });
      return;
    }

    /* Reintenta si el elemento HTML aún no se ha renderizado */
    if (!this.cardElement?.nativeElement) {
      setTimeout(() => {
        this.initStripeCard();
      }, 150);
      return;
    }

    const base = (environment.API_URL || '').replace(/\/+$/, '');

    try {
      const res: any = await firstValueFrom(
        this.http.post(`${base}/payments/create-recipe-access-intent`, {
          companyId: company.id,
        }),
      );

      if (!res?.clientSecret || !res?.connectedAccountId) {
        throw new Error(res?.error || 'Unable to initialize payment.');
      }

      this.clientSecret = res.clientSecret;

      const stripe = await loadStripe(environment.STRIPEPUBLICKEY, {
        stripeAccount: res.connectedAccountId,
      });

      if (!stripe) {
        throw new Error('Stripe failed to load.');
      }

      this.stripe = stripe;
      const elements = stripe.elements({ locale: 'en' });

      const card = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: '16px',
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif',
            '::placeholder': { color: '#9ca3af' },
          },
          invalid: { color: '#ef4444' },
        },
      });

      card.mount(this.cardElement.nativeElement);

      const container = this.cardElement.nativeElement.closest('.auth__card-element');

      card.on('focus', () => container?.classList.add('focused'));
      card.on('blur', () => container?.classList.remove('focused'));
      card.on('change', (event: any) => {
        container?.classList.toggle('invalid', !!event.error);
        container?.classList.toggle('complete', event.complete);
        this.errorMessage = event.error?.message || '';
        this.isCardComplete = event.complete;
      });

      this.card = card;
      this.stripeInitialized = true;

      setTimeout(() => {
        this.spinnerService.hide();
      }, 400);
    } catch (e: any) {
      this.spinnerService.hide();
      this.toastr.show({
        text: e?.error?.message || e?.message || 'Error loading payment form.',
        type: 'danger',
      });
    }
  }

  async processPayment() {
    if (!this.stripe || !this.card || !this.clientSecret || !this.isCardComplete) return;

    this.isProcessing.set(true);

    try {
      const user = this.currentUser();
      const result = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
            email: user?.email,
          },
        },
      });

      if (result.error) throw result.error;

      if (
        result.paymentIntent?.status === 'requires_action' ||
        result.paymentIntent?.status === 'requires_confirmation'
      ) {
        await this.handleStripeAction(result.paymentIntent.client_secret!);
      } else if (result.paymentIntent?.status === 'succeeded') {
        await this.finalizePayment(result.paymentIntent.id);
      } else {
        throw new Error('Unexpected status: ' + result.paymentIntent?.status);
      }
    } catch (e: any) {
      this.isProcessing.set(false);
      this.errorMessage = e?.message || 'Payment failed. Please try again.';
      this.toastr.show({
        text: this.errorMessage,
        type: 'danger',
        delay: 10000,
      });
    }
  }

  private async handleStripeAction(clientSecret: string) {
    if (!this.stripe) return;
    const { paymentIntent, error } = await this.stripe.handleNextAction({
      clientSecret,
    });

    if (error) {
      this.isProcessing.set(false);
      this.toastr.show({
        text: error.message || 'Verification failed',
        type: 'danger',
      });
    } else if (paymentIntent?.status === 'succeeded') {
      await this.finalizePayment(paymentIntent.id);
    } else {
      this.isProcessing.set(false);
      this.toastr.show({
        text: 'Payment could not be completed.',
        type: 'danger',
      });
    }
  }

  private async finalizePayment(paymentIntentId: string) {
    const base = (environment.API_URL || '').replace(/\/+$/, '');
    const company = this.currentCompany();

    await firstValueFrom(
      this.http.post(`${base}/payments/confirm-recipe-access`, {
        paymentIntentId,
        companyId: company?.id,
      }),
    );

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('hasRecipeAccess', 'true');
    }

    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.authService.updateCurrentUser({
        ...currentUser,
        hasRecipeAccess: true,
      });
    }

    this.isProcessing.set(false);
    this.spinnerService.hide();
    this.toastr.show({
      text: 'Payment successful! Your lifetime access is now active.',
      type: 'success',
    });

    this.router.navigate(['/remedies']);
  }
}

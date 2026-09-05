import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { firstValueFrom, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Auth as AuthService } from '../../services/auht';
import { Toast as ToastService } from '../../services/toast';
import { Spinner as SpinnerService } from '../../services/spinner';

/* ===== Validators ===== */
export const confirmPasswordValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value === confirmPassword.value
    ? null
    : { mismatch: true };
};

export const strongPasswordValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};'":\|,.<>\/?]/.test(value);
  const isLengthValid = value.length >= 8;

  const passwordValid =
    hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isLengthValid;

  return !passwordValid
    ? {
        passwordStrength: {
          hasUpperCase: !hasUpperCase,
          hasLowerCase: !hasLowerCase,
          hasNumeric: !hasNumeric,
          hasSpecialChar: !hasSpecialChar,
          isLengthValid: !isLengthValid,
        },
      }
    : null;
};

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
})
export class Auth implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private spinnerService = inject(SpinnerService);

  term: string = `By checking this box, you consent to receive marketing emails, SMS and WhatsApp messages from <strong>Herbal Remedies</strong>. Reply <strong>STOP</strong> to unsubscribe.`;

  activeTab = signal<'login' | 'register' | 'payment'>('login');
  isProcessing = signal(false);

  @ViewChild('cardElement') cardElement!: ElementRef<HTMLDivElement>;
  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  clientSecret = '';
  errorMessage = '';
  isCardComplete = false;
  private stripeInitialized = false;
  private stripeInitializing = false;

  currentCompany = this.authService.company;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator]],
  });

  registerForm = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [true, Validators.requiredTrue],
    },
    { validators: confirmPasswordValidator },
  );

  get l() {
    return this.loginForm.controls;
  }

  get f() {
    return this.registerForm.controls;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  getPasswordErrors(): string {
    const errors = this.f['password'].errors;
    if (!errors) return '';
    if (errors['required']) return 'Password is required.';
    if (errors['passwordStrength']) {
      const s = errors['passwordStrength'];
      const msgs: string[] = [];
      if (s.hasUpperCase) msgs.push('one uppercase letter');
      if (s.hasLowerCase) msgs.push('one lowercase letter');
      if (s.hasNumeric) msgs.push('one number');
      if (s.hasSpecialChar) msgs.push('one special character');
      if (s.isLengthValid) msgs.push('minimum 8 characters');
      return `Password must contain: ${msgs.join(', ')}.`;
    }
    return '';
  }

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      const company = this.currentCompany();

      if (
        tab === 'payment' &&
        company?.stripeAccountId &&
        !this.stripeInitialized &&
        !this.stripeInitializing
      ) {
        this.stripeInitializing = true;
        /*
          Delay de 200ms para darle tiempo a Angular de renderizar el @if del
          payment tab y que #cardElement exista en el DOM antes de montar Stripe.
          Esto es crítico en conexiones lentas donde el renderizado tarda más.
        */
        setTimeout(() => {
          this.initStripeCard();
        }, 200);
      }
    });
  }

  ngOnInit() {
    const user = this.currentUser();
    if (user && !user.hasRecipeAccess) {
      this.activeTab.set('payment');
    }
  }

  onSubmitLogin() {
    if (!this.loginForm.valid) return;
    this.spinnerService.show();

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.toastr.show({ text: res.message || 'Welcome back!', type: 'success' });
        const hasAccess =
          res.hasRecipeAccess ?? res.decodedToken?.hasRecipeAccess ?? false;

        if (hasAccess) {
          this.spinnerService.hide();
          localStorage.setItem('hasRecipeAccess', 'true');
          this.router.navigate(['/remedies']);
        } else {
          /*
            IMPORTANTE: NO ocultar el spinner aquí. Se mantiene activo
            durante la transición al payment tab y la carga de Stripe.
            initStripeCard() se encargará de ocultarlo cuando todo esté listo.
          */
          localStorage.setItem('hasRecipeAccess', 'false');
          this.activeTab.set('payment');
        }
      },
      error: (err) => this.showError(err),
    });
  }

  onSubmitRegister() {
    if (this.registerForm.invalid) return;
    this.spinnerService.show();
    const registrationData = this.registerForm.value;

    this.authService
      .signUp(registrationData)
      .pipe(
        switchMap(() => {
          const credentials = {
            email: registrationData.email,
            password: registrationData.password,
          };
          return this.authService.login(credentials);
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.toastr.show({
            text: 'Account created! Please complete payment.',
            type: 'success',
          });
          /*
            IMPORTANTE: NO ocultar el spinner aquí. Se mantiene activo
            durante la transición al payment tab y la carga de Stripe.
            initStripeCard() se encargará de ocultarlo cuando todo esté listo.
          */
          localStorage.setItem('hasRecipeAccess', 'false');
          this.activeTab.set('payment');
        },
        error: (err) => this.showError(err),
      });
  }

  private showError(err: any) {
    this.spinnerService.hide();
    this.toastr.show({
      text: err?.error?.message || 'An error occurred. Please try again.',
      type: 'danger',
    });
  }

  async initStripeCard() {
    /*
      Aseguramos que el spinner esté visible. Si ya lo está (por el registro/login),
      no pasa nada. Si el usuario entró directo al payment tab, lo activamos aquí.
    */
    this.spinnerService.show();
    this.errorMessage = '';

    const company = this.currentCompany();

    if (!company?.id || !company?.stripeAccountId) {
      this.spinnerService.hide();
      this.toastr.show({
        text: 'Payment configuration missing.',
        type: 'danger',
      });
      this.stripeInitializing = false;
      return;
    }

    /*
      Si el DOM aún no renderizó #cardElement (puede pasar en conexiones lentas),
      reintentamos en 150ms sin perder el spinner.
    */
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

      /*
        Pequeño delay para que Stripe termine de renderizar el iframe
        antes de quitar el spinner. Esto evita el parpadeo.
      */
      setTimeout(() => {
        this.spinnerService.hide();
      }, 400);
    } catch (e: any) {
      this.spinnerService.hide();
      this.toastr.show({
        text: e?.error?.message || e?.message || 'Error loading payment form.',
        type: 'danger',
      });
    } finally {
      this.stripeInitializing = false;
    }
  }

  async processPayment() {
    if (!this.stripe || !this.card || !this.clientSecret || !this.isCardComplete)
      return;

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

    localStorage.setItem('hasRecipeAccess', 'true');

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
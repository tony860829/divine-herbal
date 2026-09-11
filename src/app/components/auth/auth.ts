import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';

import { Auth as AuthService } from '../../services/auht';
import { Toast as ToastService } from '../../services/toast';
import { Spinner as SpinnerService } from '../../services/spinner';
import { PhoneMaskDirective } from '../../directives/phone-format.directive';
import { isPlatformBrowser } from '@angular/common';

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
  imports: [ReactiveFormsModule, PhoneMaskDirective],
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
})
export class Auth implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastr = inject(ToastService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  activeTab: 'login' | 'register' = 'login';

  term: string = `By checking this box, you consent to receive marketing emails, SMS and WhatsApp messages from <strong>Herbal Remedies</strong>. Reply <strong>STOP</strong> to unsubscribe.`;

  /* ===== Forms ===== */
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

  ngOnInit() {
    /*
      Si el usuario ya está logueado, no debería estar en auth.
      Lo mandamos a payment si no tiene acceso, o a remedies si sí lo tiene.
    */
    const user = this.authService.currentUser();
    if (user) {
      if (user.hasRecipeAccess) {
        this.router.navigate(['/remedies']);
      } else {
        this.router.navigate(['/payment']);
      }
    }
  }

  /* ===== Login ===== */
  onSubmitLogin() {
    if (!this.loginForm.valid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        this.toastr.show({ text: res.message || 'Welcome back!', type: 'success' });
        const hasAccess = res.hasRecipeAccess ?? res.decodedToken?.hasRecipeAccess ?? false;

        if (hasAccess) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('hasRecipeAccess', 'true');
            this.router.navigate(['/remedies']);
          }
        } else {
          /*
            NO ocultamos el spinner aquí. Se mantiene activo durante
            la navegación al payment. El PaymentComponent lo ocultará
            cuando Stripe esté listo.
          */
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('hasRecipeAccess', 'false');
            this.router.navigate(['/payment']);
          }
        }
      },
      error: (err) => this.showError(err),
    });
  }

  /* ===== Register + Auto-Login + Redirect to Payment ===== */
  onSubmitRegister() {
    if (this.registerForm.invalid) return;

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
            text: 'Account created! Redirecting to payment...',
            type: 'success',
          });
          /*
            NO ocultamos el spinner. La navegación a /payment lo mantiene
            cubierto hasta que el PaymentComponent monte Stripe.
          */
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('hasRecipeAccess', 'false');
            this.router.navigate(['/payment']);
          }
        },
        error: (err) => this.showError(err),
      });
  }

  private showError(err: any) {
    this.toastr.show({
      text: err?.error?.message || 'An error occurred. Please try again.',
      type: 'danger',
    });
  }
}

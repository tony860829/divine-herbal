import { Component, inject, runInInjectionContext, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Auth as AuthService } from '../../services/auht';
import { Toast } from '../../services/toast';
import { Router } from '@angular/router';
import { Cart } from '../../services/cart';

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
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
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
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  private fb = inject(FormBuilder);
  private toastr = inject(Toast);
  private authService = inject(AuthService);
  private router = inject(Router);
  term: string = `By checking this box, you consent to receive marketing emails, SMS and WhatsApp messages from <strong>Herbal Remedies</strong>. Reply <strong>STOP</strong> to unsubscribe.`;

  activeTab: 'login' | 'register' = 'login';
  stripeUrl = signal<string | null>(null);

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
      const strengthErrors = errors['passwordStrength'];
      const errorMessages = [];

      if (strengthErrors.hasUpperCase) errorMessages.push('one uppercase letter');
      if (strengthErrors.hasLowerCase) errorMessages.push('one lowercase letter');
      if (strengthErrors.hasNumeric) errorMessages.push('one number');
      if (strengthErrors.hasSpecialChar) errorMessages.push('one special character');
      if (strengthErrors.isLengthValid) errorMessages.push('minimum 8 characters');

      return `Password must contain: ${errorMessages.join(', ')}.`;
    }

    return '';
  }

  navigateAfterLogin() {
    const url = this.authService.returnUrl() || '/';
    this.authService.clearReturnUrl();
    this.router.navigateByUrl(url);
  }

  private handlePostLoginActions(res: any) {
    this.toastr.show({
      text: res.message || 'Welcome!',
      type: 'success',
    });

    runInInjectionContext(this.authService['_injector'], () => {
      const cartService = inject(Cart);

      if (cartService.items().length === 0) {
        this.navigateAfterLogin();
        return;
      }

      this.authService.getCurrentUser().subscribe((user) => {
        this.authService.currentUser.set(user);

        if (user.companies?.length) {
          this.authService.getCompanyById(user.companies[0].id).subscribe((company) => {
            this.authService.company.set(company);
            cartService.mergeLocalCartToRemote(company).subscribe({
              complete: () => this.navigateAfterLogin(),
            });
          });
        } else {
          this.navigateAfterLogin();
        }
      });
    });
  }

  onSubmitLogin() {
    if (!this.loginForm.valid) return;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => this.handlePostLoginActions(res),
      error: (err) => this.showError(err),
    });
  }

  onSubmitRegister() {
    if (this.registerForm.invalid) return;

    const registrationData = this.registerForm.value;

    this.authService.signUp(registrationData).subscribe({
      next: () => {
        const loginCredentials = {
          email: registrationData.email,
          password: registrationData.password,
        };

        this.authService.login(loginCredentials).subscribe({
          next: (loginRes: any) => {
            this.handlePostLoginActions(loginRes);
          },
          error: () => {
            this.toastr.show({
              text: 'Account created, please login manually.',
              type: 'info',
            });
            this.activeTab = 'login';
          },
        });
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

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Contact as ContactService } from '../../services/contact';
import { IContact } from '../../interfaces/contact';
import { PhoneMaskDirective } from '../../directives/phone-format.directive';
import { Toast as ToastService } from '../../services/toast';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, PhoneMaskDirective],
  providers: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private contactService = inject(ContactService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    subject: ['', [Validators.minLength(3)]],
    comment: ['', [Validators.required, Validators.minLength(4)]],
  });

  get firstName() {
    return this.form.controls.firstName;
  }
  get lastName() {
    return this.form.controls.lastName;
  }
  get email() {
    return this.form.controls.email;
  }
  get phone() {
    return this.form.controls.phone;
  }
  get subject() {
    return this.form.controls.subject;
  }
  get comment() {
    return this.form.controls.comment;
  }

  ngOnInit() {
  
  }

  onSubmit(): void {
    if (this.form.value.subject) {
      this.form.value.comment = `${this.form.value.subject}:
      ${this.form.value.comment}`;
    }
    this.contactService.saveContact(this.form.value as IContact).subscribe(() => {
      this.router.navigate(['home']);
      this.showSuccess();
    });
  }

  private showSuccess(): void {
    this.toast.show({ text: 'Data saved successfully!', type: 'success' });
  }
}

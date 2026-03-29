import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthPageLayoutComponent } from '../../layouts/auth-page-layout/auth-page-layout.component';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthPageLayoutComponent,
    TuiButton,
    TuiTextfield,
    TuiIcon,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isSuccess = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  private readonly errorMessages: Record<string, Record<string, string>> = {
    email: {
      required: 'Email là bắt buộc.',
      email: 'Email không đúng định dạng.',
    },
  };

  private getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control?.errors || !control.touched) return null;
    const firstKey = Object.keys(control.errors)[0];
    return this.errorMessages[controlName]?.[firstKey] ?? null;
  }

  get emailError() {
    return this.getError('email');
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Form value:', this.form.getRawValue());
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // this.authService.forgotPassword(this.form.getRawValue()).subscribe({
    //   next: () => {
    //     this.isSuccess.set(true);
    //     this.isSubmitting.set(false);
    //   },
    //   error: (error) => {
    //     const message = error?.error?.message || 'Gửi thất bại. Vui lòng thử lại.';
    //     this.errorMessage.set(message);
    //     this.isSubmitting.set(false);
    //   },
    // });
  }
}

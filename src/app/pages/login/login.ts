import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AuthPageLayoutComponent } from '../../layouts/auth-page-layout/auth-page-layout.component';
import { TuiButton, TuiIcon } from '@taiga-ui/core';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, AuthPageLayoutComponent, TuiIcon, TuiButton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  isChecked = false;
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showPassword = false;

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
      },
      error: (error) => {
        const message = error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        this.errorMessage.set(message);
        this.isSubmitting.set(false);
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    console.log('Email:');
    console.log('Password:');
    console.log('Remember Me:');
  }
}

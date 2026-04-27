import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthPageLayoutComponent } from '../../layouts/auth-page-layout/auth-page-layout.component';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { GoogleIconComponent } from '../../shared/components/icons/google-icon.component';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/api/auth.service';

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  // Validator hiện tại không yêu cầu gì, có thể mở rộng sau
  return null;
}

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthPageLayoutComponent,
    TuiButton,
    TuiIcon,
    TuiTextfield,
    TuiCheckbox,
    GoogleIconComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
    rememberMe: [false],
  });

  private readonly errorMessages: Record<string, Record<string, string>> = {
    email: {
      required: 'Email là bắt buộc.',
      email: 'Email không đúng định dạng.',
    },
    password: {
      required: 'Mật khẩu là bắt buộc.',
      minlength: 'Mật khẩu tối thiểu 8 ký tự.',
      // noUppercase: 'Cần ít nhất 1 chữ hoa (A-Z).',
      // noLowercase: 'Cần ít nhất 1 chữ thường (a-z).',
      // noNumber: 'Cần ít nhất 1 chữ số (0-9).',
      // noSpecial: 'Cần ít nhất 1 ký tự đặc biệt (!@#$%...).',
    },
  };

  get emailError(): string | null {
    const control = this.form.controls.email;
    if (!control.errors || !control.touched) return null;
    const firstKey = Object.keys(control.errors)[0];
    return this.errorMessages['email'][firstKey] ?? null;
  }

  get passwordError(): string | null {
    const control = this.form.controls.password;
    if (!control.errors || !control.touched) return null;
    const firstKey = Object.keys(control.errors)[0];
    return this.errorMessages['password'][firstKey] ?? null;
  }

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
        this.toast.success('Đăng nhập thành công!', 'Thành công', {
          positionClass: 'toast-top-right',
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const message = error?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        this.errorMessage.set(message);
        this.toast.error(message, 'Lỗi', {
          positionClass: 'toast-top-right',
        });
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}

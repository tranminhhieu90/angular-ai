import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthPageLayoutComponent } from '../../layouts/auth-page-layout/auth-page-layout.component';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiCheckbox } from '@taiga-ui/kit';
import { GoogleIconComponent } from '../../shared/components/icons/google-icon.component';

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const errors: ValidationErrors = {};

  if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
  //   if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
  //   if (!/[0-9]/.test(value)) errors['noNumber'] = true;
  //   if (!/[!@#$%^&*()_+\-=\[\]{}]/.test(value)) errors['noSpecial'] = true;

  return Object.keys(errors).length > 0 ? errors : null;
}

@Component({
  selector: 'app-signup',
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
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  showPassword = false;
  showConfirmPassword = false;

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue],
    },
    { validators: confirmPasswordValidator },
  );

  private readonly errorMessages: Record<string, Record<string, string>> = {
    firstName: {
      required: 'Họ là bắt buộc.',
    },
    lastName: {
      required: 'Tên là bắt buộc.',
    },
    email: {
      required: 'Email là bắt buộc.',
      email: 'Email không đúng định dạng.',
    },
    password: {
      required: 'Mật khẩu là bắt buộc.',
      minlength: 'Mật khẩu tối thiểu 8 ký tự.',
      noUppercase: 'Cần ít nhất 1 chữ hoa (A-Z).',
      noLowercase: 'Cần ít nhất 1 chữ thường (a-z).',
      //   noNumber: 'Cần ít nhất 1 chữ số (0-9).',
      //   noSpecial: 'Cần ít nhất 1 ký tự đặc biệt (!@#$%...).',
    },
    confirmPassword: {
      required: 'Vui lòng xác nhận mật khẩu.',
      mismatch: 'Mật khẩu không khớp.',
    },
    agreeToTerms: {
      required: 'Bạn cần đồng ý với điều khoản.',
    },
  };

  private getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control?.errors || !control.touched) return null;
    const firstKey = Object.keys(control.errors)[0];
    return this.errorMessages[controlName]?.[firstKey] ?? null;
  }

  get firstNameError() {
    return this.getError('firstName');
  }
  get lastNameError() {
    return this.getError('lastName');
  }
  get emailError() {
    return this.getError('email');
  }
  get passwordError() {
    return this.getError('password');
  }
  get confirmPasswordError() {
    return this.getError('confirmPassword');
  }
  get agreeToTermsError() {
    return this.getError('agreeToTerms');
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // this.authService.register(this.form.getRawValue()).subscribe({
    //   next: () => {
    //     this.isSubmitting.set(false);
    //   },
    //   error: (error) => {
    //     const message = error?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
    //     this.errorMessage.set(message);
    //     this.isSubmitting.set(false);
    //   },
    // });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

function confirmPasswordValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (confirmPassword && password !== confirmPassword) {
    group.get('confirmPassword')?.setErrors({ mismatch: true });
  }
  return null;
}

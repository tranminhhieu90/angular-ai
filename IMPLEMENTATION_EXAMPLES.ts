// ============================================================
// EXAMPLE: JWT Authentication Implementation Guide
// ============================================================

// ───────────────────────────────────────────────────────────
// 1. LOGIN COMPONENT
// ───────────────────────────────────────────────────────────

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    // 📌 Gửi request login
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.toast.success('Đăng nhập thành công!');
        // ✓ Tokens đã được lưu tự động
        // ✓ currentUser đã được cập nhật
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const message = error?.error?.message || 'Đăng nhập thất bại';
        this.errorMessage.set(message);
        this.toast.error(message);
      },
    });
  }
}

// ───────────────────────────────────────────────────────────
// 2. SIGNUP COMPONENT
// ───────────────────────────────────────────────────────────

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: ['user'],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isSubmitting.set(true);

    // 📌 Gửi request signup
    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // ✓ Tokens đã được lưu tự động
        // ✓ Redirect về dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'Đăng ký thất bại');
      },
    });
  }
}

// ───────────────────────────────────────────────────────────
// 3. PROTECTED COMPONENT (chỉ cho người đăng nhập)
// ───────────────────────────────────────────────────────────

@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="authService.isLoggedIn()">
      <h1>Welcome {{ currentUser()?.firstName }}</h1>
      <p>Email: {{ currentUser()?.email }}</p>
      <button (click)="logout()">Logout</button>
    </div>
  `,
})
export class DashboardComponent {
  readonly authService = inject(AuthService);

  get currentUser() {
    return this.authService.currentUser;
  }

  logout(): void {
    this.authService.logout();
    // ✓ Tokens xóa
    // ✓ User cleared
    // ✓ Redirect /login
  }
}

// ───────────────────────────────────────────────────────────
// 4. AUTH GUARD (bảo vệ route)
// ───────────────────────────────────────────────────────────

import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect về login nếu chưa đăng nhập
  return router.createUrlTree(['/login']);
};

// Sử dụng trong routes:
// const routes: Routes = [
//   {
//     path: 'dashboard',
//     component: DashboardComponent,
//     canActivate: [authGuard]  // ← Bảo vệ route
//   }
// ];

// ───────────────────────────────────────────────────────────
// 5. INTERCEPTOR (gắn token tự động)
// ───────────────────────────────────────────────────────────

// File: core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../api/auth.service';
import { AuthTokenService } from '../api/auth-token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1️⃣ Gắn access token vào request
  const token = tokenService.getAccessToken();
  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  // 2️⃣ Gửi request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 3️⃣ Nếu 401 (token hết hạn)
      if (error.status === 401 && !req.url.includes('auth/refresh')) {
        // Thử refresh token
        return authService.refreshToken().pipe(
          // 4️⃣ Refresh thành công, retry request với token mới
          switchMap((res) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            return next(retryReq);
          }),
          // 5️⃣ Refresh fail, logout
          catchError(() => {
            tokenService.clear();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};

// ───────────────────────────────────────────────────────────
// 6. FLOW DIAGRAM
// ───────────────────────────────────────────────────────────

/*
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────┘

User Input
  ↓
Form Validation
  ↓
AuthService.login({email, password})
  ↓
POST /api/auth/login
  ↓
Backend Response:
  {
    accessToken: "jwt...",
    refreshToken: "jwt...",
    user: { id, email, ... }
  }
  ↓
handleAuthSuccess():
  ├─ AuthTokenService.setTokens()  [Save to localStorage]
  ├─ _currentUser.set(user)         [Update signal]
  └─ saveUserToStorage()            [Persist user]
  ↓
Component:
  ├─ isSubmitting = false
  ├─ Show success toast
  └─ router.navigate(['/dashboard'])


┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATED REQUEST FLOW                      │
└─────────────────────────────────────────────────────────────┘

User Action (GET /api/users)
  ↓
HttpClient interceptor:
  ├─ Get access token from localStorage
  └─ Add header: Authorization: Bearer {token}
  ↓
Request sent to server
  ↓
Server Response:
  ├─ 200-299: Return data ✓
  │   ↓
  │   Return to component
  │
  └─ 401: Unauthorized
      ↓
      Interceptor catches error
      ↓
      AuthService.refreshToken()
        POST /api/auth/refresh {refreshToken}
        ↓
        ├─ 200: New tokens received
        │   ├─ Save new tokens
        │   ├─ Retry original request
        │   └─ Return data to component ✓
        │
        └─ 401/Error: Refresh also failed
            ├─ Clear tokens
            ├─ Set _currentUser = null
            └─ Redirect /login


┌─────────────────────────────────────────────────────────────┐
│                   LOGOUT FLOW                               │
└─────────────────────────────────────────────────────────────┘

User Click Logout
  ↓
AuthService.logout()
  ├─ POST /api/auth/logout {refreshToken}
  │  └─ Backend revokes token
  ├─ AuthTokenService.clear()  [Remove from localStorage]
  ├─ _currentUser.set(null)    [Clear user data]
  └─ router.navigate(['/login'])
  ↓
Ready for new login
*/

// ───────────────────────────────────────────────────────────
// 7. STORAGE STRUCTURE
// ───────────────────────────────────────────────────────────

/*
localStorage:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "currentUser": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
*/

// ───────────────────────────────────────────────────────────
// 8. ERROR HANDLING
// ───────────────────────────────────────────────────────────

// Example: Handle different error scenarios
authService.login(credentials).subscribe({
  next: (response) => {
    // Success
    console.log('Logged in:', response.user);
  },
  error: (error) => {
    // Error structure
    if (error.status === 401) {
      console.error('Invalid credentials');
    } else if (error.status === 429) {
      console.error('Too many login attempts');
    } else if (error.status === 500) {
      console.error('Server error');
    } else {
      console.error('Unknown error:', error);
    }
  },
});

// ───────────────────────────────────────────────────────────
// 9. ADVANCED: TOKEN REFRESH BEFORE EXPIRY
// ───────────────────────────────────────────────────────────

/*
Có thể add logic proactive refresh:
- Decode JWT để lấy expiry time
- Refresh token trước khi hết hạn (10 phút trước)
- Sử dụng timer hoặc scheduler

Implement ở AuthService:
1. Decode access token
2. Calculate time until expiry
3. Schedule refresh 10 min before expiry
4. Tự động refresh
*/

// ───────────────────────────────────────────────────────────
// 10. TESTING
// ───────────────────────────────────────────────────────────

import { TestBed } from '@angular/core/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService],
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login and save tokens', () => {
    const mockResponse = {
      accessToken: 'mock_access',
      refreshToken: 'mock_refresh',
      user: { id: '1', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
    };

    service.login({ email: 'test@test.com', password: 'pass', rememberMe: false }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockResponse);

    expect(localStorage.getItem('accessToken')).toBe('mock_access');
    expect(localStorage.getItem('refreshToken')).toBe('mock_refresh');
    expect(service.isLoggedIn()).toBe(true);
  });

  afterEach(() => {
    httpMock.verify();
  });
});

// ───────────────────────────────────────────────────────────
// END OF EXAMPLES
// ───────────────────────────────────────────────────────────

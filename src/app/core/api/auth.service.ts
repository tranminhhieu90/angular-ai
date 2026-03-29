// core/services/auth.service.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthTokenService } from './auth-token.service';

// ─── Interfaces ───────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Service ──────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  private readonly tokenService = inject(AuthTokenService);
  private readonly router = inject(Router);
  protected override readonly serviceName = 'auth' as const;

  // State
  private readonly _currentUser = signal<UserProfile | null>(this.getUserFromStorage());

  // Selectors
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());

  // ── Auth ────────────────────────────────────────────────
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/login', payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/register', payload).pipe(
      tap((res) => this.handleAuthSuccess(res)),
    );
  }

  logout(): void {
    // Gọi API logout nếu BE cần revoke token
    this.post('auth/logout', {
      refreshToken: this.tokenService.getRefreshToken(),
    }).subscribe({ error: () => {} }); // ignore error

    this.tokenService.clear();
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ── Password ────────────────────────────────────────────
  forgotPassword(payload: ForgotPasswordPayload): Observable<void> {
    return this.post<void>('auth/forgot-password', payload);
  }

  resetPassword(payload: ResetPasswordPayload): Observable<void> {
    return this.post<void>('auth/reset-password', payload);
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.patch<void>('auth/change-password', payload);
  }

  // ── Token ───────────────────────────────────────────────
  refreshToken(): Observable<AuthResponse> {
    return this.post<AuthResponse>('auth/refresh', {
      refreshToken: this.tokenService.getRefreshToken(), // ← lấy token từ tokenService
    }).pipe(
      tap((res) => {
        this.tokenService.setTokens(res.accessToken, res.refreshToken);
        this._currentUser.set(res.user);
      }),
    );
  }

  // ── Profile ─────────────────────────────────────────────
  getProfile(): Observable<UserProfile> {
    return this.get<UserProfile>('auth/me').pipe(
      tap((user) => {
        this._currentUser.set(user);
        this.saveUserToStorage(user);
      }),
    );
  }

  // ── Helpers ─────────────────────────────────────────────
  private handleAuthSuccess(res: AuthResponse): void {
    this.tokenService.setTokens(res.accessToken, res.refreshToken);
    this._currentUser.set(res.user);
    this.saveUserToStorage(res.user);
  }

  private saveUserToStorage(user: UserProfile): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  private getUserFromStorage(): UserProfile | null {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  }
}

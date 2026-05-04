// core/services/auth.service.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, Observable, of, tap, throwError } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AuthTokenService } from './auth-token.service';

// ─── Interfaces ───────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    user: UserProfile;
  };
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
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

  constructor() {
    super();
    console.log('AuthService initialized', this.serviceName);
  }
  // State
  private readonly _currentUser = signal<UserProfile | null>(this.getUserFromStorage());

  // Selectors
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser() && this.tokenService.hasTokens());

  // ── Auth ────────────────────────────────────────────────
  login(payload: LoginPayload, rememberMe = false): Observable<AuthPayload> {
    return this.post<AuthResponse>('auth/login', payload).pipe(
      map((res) => res.data),
      tap((res) => this.handleAuthSuccess(res, rememberMe)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthPayload> {
    return this.post<AuthResponse>('auth/register', payload).pipe(
      map((res) => res.data),
      tap((res) => this.handleAuthSuccess(res, true)),
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken || this.tokenService.isRefreshTokenExpired()) {
      this.clearSession();
      this.router.navigate(['/login']);
      return of(void 0);
    }

    return this.post<void>('auth/logout', {
      refreshToken,
    }).pipe(
      finalize(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      }),
    );
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
  refreshToken(): Observable<AuthPayload> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken || this.tokenService.isRefreshTokenExpired()) {
      this.clearSession();
      return throwError(() => new Error('Refresh token expired'));
    }

    return this.post<AuthResponse>('auth/refresh', {
      refreshToken,
    }).pipe(
      map((res) => res.data),
      tap((res) => {
        this.tokenService.setTokens(
          res.accessToken,
          res.refreshToken,
          this.tokenService.shouldPersistSession(),
        );
        this._currentUser.set(res.user);
        this.saveUserToStorage(res.user);
      }),
    );
  }

  hasActiveSession(): boolean {
    if (!this.tokenService.hasTokens() || this.tokenService.isRefreshTokenExpired()) {
      this.clearSession();
      return false;
    }

    return !!this._currentUser();
  }

  clearSession(): void {
    this.tokenService.clear();
    this._currentUser.set(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
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
  private handleAuthSuccess(res: AuthPayload, rememberMe: boolean): void {
    this.tokenService.setTokens(res.accessToken, res.refreshToken, rememberMe);
    this._currentUser.set(res.user);
    this.saveUserToStorage(res.user);
  }

  private saveUserToStorage(user: UserProfile): void {
    if (this.tokenService.shouldPersistSession()) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.removeItem('currentUser');
      return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.removeItem('currentUser');
  }

  private getUserFromStorage(): UserProfile | null {
    const raw = localStorage.getItem('currentUser') ?? sessionStorage.getItem('currentUser');
    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }

    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      return null;
    }
  }
}

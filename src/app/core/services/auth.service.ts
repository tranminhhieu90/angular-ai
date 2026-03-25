import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { AuthApiService, AuthResponse, LoginRequest } from '../api/auth-api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApi = inject(AuthApiService);
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn.asReadonly();
  private refreshInFlight$?: Observable<string>;
  private readonly accessTokenKey = 'token';
  private readonly refreshTokenKey = 'refresh_token';

  constructor(private router: Router) {
    this._isLoggedIn.set(!!this.getAccessToken());
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.authApi.login(payload).pipe(
      tap((response) => {
        this.setSession(response);
        this.router.navigate(['/dashboard']);
      }),
    );
  }

  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('Missing refresh token'));
    }

    this.refreshInFlight$ = this.authApi.refreshToken(refreshToken).pipe(
      tap((response) => this.setSession(response)),
      map((response) => response.accessToken),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
      finalize(() => {
        this.refreshInFlight$ = undefined;
      }),
      shareReplay(1),
    );

    return this.refreshInFlight$;
  }

  logout() {
    this.authApi.logout().subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  logoutLocalOnly(): void {
    this.clearSession();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.accessTokenKey, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, response.refreshToken);
    }
    this._isLoggedIn.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this._isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}

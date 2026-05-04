// core/services/auth-token.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly REMEMBER_ME_KEY = 'rememberMe';
  private readonly EXPIRY_SKEW_MS = 30_000;

  getAccessToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ?? sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
    );
  }

  getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ?? sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  shouldPersistSession(): boolean {
    return localStorage.getItem(this.REMEMBER_ME_KEY) === 'true';
  }

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  isAccessTokenExpired(): boolean {
    return this.isTokenExpired(this.getAccessToken());
  }

  isRefreshTokenExpired(): boolean {
    return this.isTokenExpired(this.getRefreshToken(), 0);
  }

  setTokens(accessToken: string, refreshToken: string, rememberMe = false): void {
    localStorage.setItem(this.REMEMBER_ME_KEY, String(rememberMe));

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    targetStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    targetStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

    otherStorage.removeItem(this.ACCESS_TOKEN_KEY);
    otherStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private isTokenExpired(token: string | null, skewMs = this.EXPIRY_SKEW_MS): boolean {
    if (!token) {
      return true;
    }

    const payload = this.getTokenPayload(token);
    if (!payload?.exp) {
      return false;
    }

    return Date.now() >= payload.exp * 1000 - skewMs;
  }

  private getTokenPayload(token: string): { exp?: number } | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return null;
      }

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '=',
      );

      return JSON.parse(atob(paddedPayload));
    } catch {
      return null;
    }
  }
}

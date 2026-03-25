import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { AUTH_API_BASE_URL } from './api.config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthApiService extends BaseApiService {
  protected readonly apiBaseUrl = inject(AUTH_API_BASE_URL);

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.post<AuthResponse, LoginRequest>('auth/login', payload);
  }

  logout(): Observable<void> {
    return this.post<void, Record<string, never>>('auth/logout', {});
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.post<AuthResponse, { refreshToken: string }>('auth/refresh-token', { refreshToken });
  }

  me(): Observable<AuthResponse['user']> {
    return this.get<AuthResponse['user']>('auth/me');
  }
}

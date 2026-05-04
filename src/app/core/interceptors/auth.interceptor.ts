// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthPayload, AuthService } from '@/app/core/api/auth.service';
import { AuthTokenService } from '@/app/core/api/auth-token.service';

let refreshRequest$: Observable<AuthPayload> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthRequest = isAuthEndpoint(req.url);
  const shouldHandleAuth = !isAuthRequest;
  const token = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();

  if (shouldHandleAuth && refreshToken && tokenService.isRefreshTokenExpired()) {
    authService.clearSession();
    router.navigate(['/login']);
    return throwError(() => new Error('Refresh token expired'));
  }

  if (shouldHandleAuth && token && tokenService.isAccessTokenExpired()) {
    if (!refreshToken) {
      authService.clearSession();
      router.navigate(['/login']);
      return throwError(() => new Error('Refresh token missing'));
    }

    return refreshAccessToken(authService).pipe(
      switchMap((res) => next(addAuthHeader(req, res.accessToken))),
      catchError((error) => handleRefreshFailure(error, authService, router)),
    );
  }

  const authReq = shouldHandleAuth && token ? addAuthHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && shouldHandleAuth) {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken || tokenService.isRefreshTokenExpired()) {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        return refreshAccessToken(authService).pipe(
          switchMap((res) => {
            return next(addAuthHeader(req, res.accessToken));
          }),
          catchError((refreshError) => handleRefreshFailure(refreshError, authService, router)),
        );
      }
      return throwError(() => error);
    }),
  );
};

function refreshAccessToken(authService: AuthService): Observable<AuthPayload> {
  if (!refreshRequest$) {
    refreshRequest$ = authService.refreshToken().pipe(
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        refreshRequest$ = null;
      }),
    );
  }

  return refreshRequest$;
}

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handleRefreshFailure(error: unknown, authService: AuthService, router: Router) {
  authService.clearSession();
  router.navigate(['/login']);
  return throwError(() => error);
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('auth/login') ||
    url.includes('auth/register') ||
    url.includes('auth/refresh') ||
    url.includes('auth/logout') ||
    url.includes('auth/forgot-password') ||
    url.includes('auth/reset-password')
  );
}

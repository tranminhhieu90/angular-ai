// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/app/core/api/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasActiveSession()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

// Guard ngược lại: đã login rồi thì không vào login/signup nữa
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasActiveSession()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};

// core/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(private router: Router) {
    // Kiểm tra token khi khởi động app
    const token = localStorage.getItem('token');
    this._isLoggedIn.set(!!token);
  }

  login(token: string) {
    localStorage.setItem('token', token);
    this._isLoggedIn.set(true);
    this.router.navigate(['/dashboard']);
  }

  logout() {
    localStorage.removeItem('token');
    this._isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}

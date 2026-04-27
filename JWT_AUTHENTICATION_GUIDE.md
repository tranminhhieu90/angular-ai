# JWT Authentication Guide - Angular AI

## 📋 Tổng Quan Hệ Thống

Dự án sử dụng **JWT (JSON Web Token)** với pattern **Access Token + Refresh Token** cho phép:
- ✅ Tăng bảo mật (access token có thời gian sống ngắn)
- ✅ Tự động refresh token khi hết hạn
- ✅ Đăng xuất toàn cầu (revoke refresh token)

---

## 🏗️ Cấu Trúc Các Service

### 1. **AuthTokenService** (`core/api/auth-token.service.ts`)
Quản lý lưu trữ tokens trong localStorage

```typescript
// Lấy access token
getAccessToken(): string | null

// Lấy refresh token
getRefreshToken(): string | null

// Lưu cả 2 tokens
setTokens(accessToken: string, refreshToken: string): void

// Xóa cả 2 tokens
clear(): void
```

**Storage Keys:**
- `accessToken` - Token ngắn hạn (~15 phút)
- `refreshToken` - Token dài hạn (~7 ngày)

---

### 2. **AuthService** (`core/api/auth.service.ts`)

#### Interfaces:
```typescript
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
```

#### Các Methods Chính:

##### **login(payload: LoginPayload)**
```typescript
// Gửi email + password
// Backend trả về accessToken + refreshToken + user info
// Tự động lưu tokens vào localStorage
// Cập nhật currentUser signal

this.authService.login({
  email: 'user@example.com',
  password: 'password123',
  rememberMe: true
}).subscribe({
  next: () => {
    // Đăng nhập thành công
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    // Lỗi đăng nhập
  }
});
```

##### **refreshToken()**
```typescript
// Gửi refresh token để lấy access token mới
// Được gọi tự động khi access token hết hạn (401 error)
// Cập nhật tokens mới trong localStorage

this.authService.refreshToken().subscribe({
  next: (res) => {
    // Token đã được cập nhật
  },
  error: () => {
    // Refresh token cũng hết hạn - redirect login
  }
});
```

##### **logout()**
```typescript
// Gọi API logout để revoke refresh token trên backend
// Xóa tokens khỏi localStorage
// Xóa user info
// Redirect về login page

this.authService.logout();
```

##### **register(payload: RegisterPayload)**
```typescript
// Đăng ký tài khoản
// Backend trả về accessToken + refreshToken + user info
// Tự động lưu tokens và logged in

this.authService.register({
  userName: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  role: 'user'
}).subscribe({...});
```

#### Signals (Reactive State):
```typescript
// Người dùng hiện tại
readonly currentUser = this._currentUser.asReadonly();

// Kiểm tra đã đăng nhập hay chưa
readonly isLoggedIn = computed(() => !!this._currentUser());
```

---

### 3. **AuthInterceptor** (`core/interceptors/auth.interceptor.ts`)

Tự động gắn access token vào header của mọi request:

```typescript
// Bước 1: Gắn access token vào Authorization header
Authorization: Bearer {accessToken}

// Bước 2: Nếu server trả về 401 (token hết hạn)
//         → Gọi refreshToken() để lấy token mới
//         → Retry request với token mới

// Bước 3: Nếu refresh token cũng hết hạn
//         → Xóa tokens
//         → Redirect về login
//         → Throw error
```

**Flow Chi Tiết:**
```
1. User gửi request
   ↓
2. Interceptor gắn access token
   ↓
3. Server xử lý
   ├─ 200: Trả về data ✓
   └─ 401: Hết hạn
       ↓
4. Interceptor bắt 401 error
   ↓
5. Gọi refreshToken() API
   ├─ 200: Lấy token mới ✓
   │   ↓
   │   Retry request với token mới
   │   ↓
   │   Server xử lý thành công ✓
   │
   └─ 401/Error: Refresh token hết hạn
       ↓
       Clear tokens → Redirect login
```

---

## 🔄 Flow Đầy Đủ

### Login Flow:
```
1. User nhập email/password
2. Submit form
3. AuthService.login(data)
   ├─ POST /auth/login
   │
4. Backend xác minh credentials
   ├─ Valid:
   │  └─ Trả về {accessToken, refreshToken, user}
   │     ↓
   │     AuthService.handleAuthSuccess()
   │     ├─ Lưu tokens: AuthTokenService.setTokens()
   │     ├─ Lưu user: _currentUser.set(user)
   │     └─ Lưu localStorage: currentUser JSON
   │        ↓
   │        Success! Redirect /dashboard
   │
   └─ Invalid:
      └─ Trả về error message
         ↓
         Hiển thị thông báo lỗi
```

### Authenticated Request Flow:
```
1. User gửi request (VD: GET /api/users)
   ↓
2. AuthInterceptor.intercept()
   ├─ Lấy access token
   └─ Gắn vào header: Authorization: Bearer {token}
   ↓
3. Backend xác minh token
   ├─ Valid: Xử lý request ✓
   │
   └─ Invalid (401):
      ↓
      AuthInterceptor bắt error
      ↓
      refreshToken() được gọi
      ├─ POST /auth/refresh {refreshToken}
      │
      ├─ Backend cấp token mới ✓
      │  ├─ Lưu token mới
      │  └─ Retry request gốc
      │
      └─ Backend reject ✗
         ├─ Clear tokens
         └─ Redirect /login
```

### Logout Flow:
```
1. User click logout button
2. AuthService.logout()
   ├─ POST /auth/logout {refreshToken}  (gọi API để revoke token)
   ├─ AuthTokenService.clear()          (xóa tokens)
   ├─ _currentUser.set(null)            (xóa user)
   └─ router.navigate(['/login'])       (redirect login)
```

---

## 💾 Storage Structure

```json
// localStorage
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "currentUser": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## 🔐 Token Lifespan Best Practices

```
Access Token:
├─ Thời gian sống: 15 phút (ngắn)
├─ Nên lưu: RAM hoặc sessionStorage
└─ Lý do: Bảo mật cao, nếu bị leak thì ảnh hưởng ít

Refresh Token:
├─ Thời gian sống: 7 ngày (dài)
├─ Nên lưu: localStorage (hoặc httpOnly cookie - an toàn nhất)
└─ Lý do: Cho phép refresh token mà không cần đăng nhập lại
```

---

## 🛡️ Bảo Mật

### ✅ Điểm Tích Cực:
1. Access token ngắn hạn (giảm rủi ro khi bị leak)
2. Tự động refresh token khi hết hạn (UX tốt)
3. Logout có gọi API revoke (prevent token reuse)

### ⚠️ Cần Cải Thiện:
1. **httpOnly Cookie**: Nên lưu refreshToken trong httpOnly cookie thay localStorage
   - Ngăn chặn XSS attacks
   - JavaScript không thể truy cập được

2. **CSRF Protection**: Thêm CSRF token
3. **Token Rotation**: Thay đổi token thường xuyên
4. **Secure Flag**: Chỉ gửi token qua HTTPS

---

## 🚀 Cách Sử Dụng

### Ở Component:
```typescript
import { AuthService } from '../../core/api/auth.service';

export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSubmit() {
    this.authService.login({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true
    }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
```

### Check Auth Status:
```typescript
// Ở template
<div *ngIf="authService.isLoggedIn()">
  Welcome {{ authService.currentUser()?.firstName }}
</div>

// Ở component
if (this.authService.isLoggedIn()) {
  // Đã đăng nhập
}
```

### Ở Guard:
```typescript
import { AuthService } from './auth.service';

export const authGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  
  if (authService.isLoggedIn()) {
    return true;
  }
  
  return inject(Router).createUrlTree(['/login']);
};
```

---

## 📝 Cấu Hình App

### app.config.ts:
```typescript
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    withInterceptors([authInterceptor])
  ]
};
```

---

## 🧪 Testing

### Mock Login:
```typescript
const mockUser: UserProfile = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
};

const mockResponse: AuthResponse = {
  accessToken: 'mock_access_token',
  refreshToken: 'mock_refresh_token',
  user: mockUser
};

// Trong test
spyOn(authService, 'login').and.returnValue(of(mockResponse));
```

---

## 🐛 Troubleshooting

### Issue: Token không được lưu
**Solution**: Kiểm tra `AuthTokenService.setTokens()` được gọi trong `handleAuthSuccess()`

### Issue: Refresh token không hoạt động
**Solution**: Kiểm tra interceptor có đang bắt 401 error không

### Issue: Vẫn gửi request sau khi logout
**Solution**: Kiểm tra lại AuthService.logout() có xóa token không

---

## 📚 Tài Liệu Tham Khảo

- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519)
- [Angular HttpInterceptor](https://angular.io/api/common/http/HttpInterceptor)
- [Angular Signals](https://angular.io/guide/signals)

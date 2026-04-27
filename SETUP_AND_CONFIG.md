# JWT Implementation - Setup & Configuration

## 🚀 Quick Start Checklist

- [x] **AuthTokenService** - Quản lý storage tokens
- [x] **AuthService** - Xử lý logic auth (login, logout, refresh)
- [x] **AuthInterceptor** - Gắn token tự động + handle 401
- [x] **Login Component** - UI đăng nhập
- [x] **Signup Component** - UI đăng ký
- [ ] **Auth Guard** - Bảo vệ route (cần thêm)
- [ ] **Logout functionality** - (đã implement)

---

## 📦 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── api/
│   │   │   ├── auth.service.ts              ✅ DONE
│   │   │   ├── auth-token.service.ts        ✅ DONE
│   │   │   ├── base-api.service.ts          ✅ DONE
│   │   │   ├── api-config.service.ts
│   │   │   └── [other services]
│   │   ├── guards/
│   │   │   ├── auth.guard.ts                ❌ TODO
│   │   │   └── [other guards]
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts          ✅ DONE
│   │       └── [other interceptors]
│   ├── pages/
│   │   ├── login/
│   │   │   ├── login.ts                     ✅ UPDATED
│   │   │   └── [template/styles]
│   │   ├── signup/
│   │   │   ├── signup.component.ts          ✅ UPDATED
│   │   │   └── [template/styles]
│   │   └── dashboard/
│   │       └── [protected pages]
│   └── app.ts                               ✅ DONE (routes + config)
└── main.ts
```

---

## 🔧 Configuration Files

### app.ts - Register Interceptor

```typescript
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other config
    withInterceptors([authInterceptor]),  // ← Add this
  ]
};
```

---

## 📋 Implementation Status

### ✅ COMPLETED

#### 1. AuthTokenService
- Lưu/lấy accessToken
- Lưu/lấy refreshToken
- Xóa tokens

#### 2. AuthService
- `login()` - Đăng nhập + save tokens
- `register()` - Đăng ký + save tokens
- `logout()` - Đăng xuất + clear tokens
- `refreshToken()` - Refresh token when expired
- `changePassword()` - Đổi mật khẩu
- `forgotPassword()` - Quên mật khẩu
- `resetPassword()` - Reset mật khẩu
- `getProfile()` - Lấy thông tin user
- Signals: `currentUser`, `isLoggedIn`

#### 3. AuthInterceptor
- Gắn Authorization header
- Tự động refresh token on 401
- Redirect login khi refresh fail

#### 4. Login Component
- Form validation
- Call AuthService.login()
- Save tokens (automatic)
- Redirect to dashboard

#### 5. Signup Component
- Form validation
- Call AuthService.register()
- Save tokens (automatic)
- Redirect to dashboard

---

## ❌ TODO - Cần implement

### 1. Auth Guard
Bảo vệ protected routes

```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../api/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
```

### 2. Update Routes
```typescript
// src/app/app.routes.ts
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]  // Chỉ chưa đăng nhập
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [publicGuard]
  },

  // Protected routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]  // Chỉ đã đăng nhập
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },

  // Default redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];
```

---

## 🧪 Test Scenarios

### Scenario 1: Successful Login
```
1. User nhập email + password
2. Click "Đăng nhập"
3. Component gọi authService.login()
4. Server trả 200 + tokens
5. ✓ Tokens lưu localStorage
6. ✓ User data lưu signal
7. ✓ Redirect /dashboard
```

### Scenario 2: Token Expiry
```
1. User đang dùng app (token hết hạn)
2. User click button để call API
3. Request gắn access token (old)
4. Server trả 401
5. Interceptor bắt error
6. Gọi refreshToken() API
7. Server trả token mới
8. ✓ Token cập nhật localStorage
9. ✓ Retry request với token mới
10. ✓ API thành công
```

### Scenario 3: Refresh Token Expiry
```
1. Cả access token và refresh token hết hạn
2. User click button → API call
3. Server trả 401
4. Interceptor gọi refreshToken()
5. Server trả 401 (refresh token cũng hết)
6. Interceptor bắt lỗi
7. ✓ Clear tokens
8. ✓ Redirect /login
9. ✓ User phải đăng nhập lại
```

### Scenario 4: Logout
```
1. User click logout button
2. authService.logout() được gọi
3. POST /api/auth/logout (revoke token)
4. ✓ Clear localStorage
5. ✓ Clear signal
6. ✓ Redirect /login
```

### Scenario 5: Session Recovery
```
1. User logout
2. Refresh page (F5)
3. Check localStorage
4. ✓ Tokens cleared
5. ✓ User redirected /login
```

---

## 🔐 Security Considerations

### Token Storage
```
Current: localStorage (JavaScript accessible)
Risks:  XSS dapat steal tokens

Better: httpOnly Cookies
Benefits:
- JavaScript không thể access
- Tự động gửi trong requests
- CSRF-protected nếu có token riêng
```

### Token Refresh
```
✓ Automatic on 401
✓ Access token ngắn hạn (15 min)
✓ Refresh token dài hạn (7 days)
```

### Password Security
```
Validators:
- Minimum 8 characters
- At least 1 uppercase letter

TODO:
- Add HTTPS enforcement
- Add rate limiting
- Add CSRF protection
- Add password strength meter
```

---

## 📊 Flow Diagrams

### Login Flow
```
┌──────────────┐
│  User Login  │
└──────────────┘
       │
       ▼
┌──────────────────────────────┐
│  POST /auth/login            │
│  {email, password}           │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Server validates            │
└──────────────────────────────┘
       │
   ┌───┴───┐
   ▼       ▼
 200     401/500
  │        │
  ▼        ▼
Success  Error
  │        │
  ▼        ▼
Save    Show
Token   Error
  │
  ▼
Redirect
Dashboard
```

### Request with Token
```
┌──────────────┐
│  Make Request│
└──────────────┘
       │
       ▼
┌────────────────────────────┐
│  Interceptor               │
│  getAccessToken()          │
│  add Authorization header  │
└────────────────────────────┘
       │
       ▼
┌────────────────────────────┐
│  Send request              │
└────────────────────────────┘
       │
   ┌───┴────┐
   ▼        ▼
 200      401
  │        │
  ▼        ▼
Return  Refresh
Data    Token
         │
    ┌────┴────┐
    ▼         ▼
  200       401
   │         │
   ▼         ▼
Retry    Logout
Request
```

---

## 🛠️ Debugging Tips

### Check if logged in
```typescript
// Terminal / Console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('currentUser')

// In component
this.authService.isLoggedIn()
this.authService.currentUser()
```

### Check token content
```typescript
// Decode JWT (online: jwt.io)
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// { user_id, email, exp, iat, ... }
```

### Monitor network requests
```
Chrome DevTools → Network tab
- Look for /auth/login
- Check response headers
- Check response body (tokens)
- Check subsequent requests (Authorization header)
```

### Check interceptor execution
```typescript
// Add console logs in auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔵 Interceptor:', req.url);
  console.log('🔑 Token:', tokenService.getAccessToken()?.substring(0, 20) + '...');
  
  // ... rest of code
};
```

---

## 📈 Performance Optimization

### 1. Token Caching
```
Hiện tại: Mỗi request lấy token từ localStorage
Optimize: Cache token trong memory, chỉ refresh when needed
```

### 2. Signals Reactivity
```
✓ isLoggedIn computed - recompute khi currentUser thay đổi
✓ Avoid unnecessary subscriptions
```

### 3. Request Cancellation
```
Idea: Cancel pending requests khi logout
Tool: takeUntil(destroy$)
```

---

## 📚 Related Files

1. **auth.service.ts** - Main auth logic
2. **auth-token.service.ts** - Token storage
3. **auth.interceptor.ts** - Auto token + refresh
4. **login.ts** - Login page
5. **signup.component.ts** - Signup page
6. **base-api.service.ts** - HTTP requests
7. **app.routes.ts** - Route definitions
8. **app.config.ts** - App configuration

---

## ✅ Checklist Implementasi

### Core Auth
- [x] AuthService dengan login/logout/refresh
- [x] AuthTokenService untuk storage
- [x] AuthInterceptor untuk auto token
- [x] Login component form
- [x] Signup component form

### UI/UX
- [x] Form validation
- [x] Error messages
- [x] Success notifications
- [x] Loading states

### Security
- [ ] Auth guard implementation
- [ ] HTTPS enforcement
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] httpOnly cookies (optional)

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Documentation
- [x] JWT_AUTHENTICATION_GUIDE.md
- [x] IMPLEMENTATION_EXAMPLES.ts
- [x] SETUP_AND_CONFIG.md (this file)

---

## 🚀 Next Steps

1. **Implement auth.guard.ts** - Create guard for protected routes
2. **Add auth guard to routes** - Protect dashboard routes
3. **Add error handling** - Handle various error scenarios
4. **Add testing** - Unit + integration tests
5. **Deploy** - Configure for production
   - Set secure cookies
   - Enable HTTPS
   - Configure CORS
   - Rate limiting

---

## 📞 Support

Tham khảo files:
- `JWT_AUTHENTICATION_GUIDE.md` - Chi tiết architecture
- `IMPLEMENTATION_EXAMPLES.ts` - Code examples
- `auth.service.ts` - Source code

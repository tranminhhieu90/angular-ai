# 🚀 JWT Authentication - Quick Reference

## 📋 One-Minute Summary

Dự án đã có đầy đủ JWT Authentication với:
- ✅ **Login** - Đăng nhập, lưu tokens
- ✅ **Signup** - Đăng ký, tự động lưu tokens  
- ✅ **Token Refresh** - Tự động refresh khi hết hạn
- ✅ **Logout** - Đăng xuất, xóa tokens
- ✅ **Auto Token Injection** - Gắn token vào mọi request
- ✅ **Error Handling** - Bắt lỗi, retry, redirect login

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `auth.service.ts` | Login, logout, refresh token, user management |
| `auth-token.service.ts` | Lưu/lấy tokens từ localStorage |
| `auth.interceptor.ts` | Gắn token + tự động refresh on 401 |
| `login.ts` | Login page - form + validation |
| `signup.component.ts` | Signup page - form + validation |

---

## 💻 Usage - Component

### Login User
```typescript
export class LoginComponent {
  private authService = inject(AuthService);

  onSubmit() {
    this.authService.login({
      email: 'user@example.com',
      password: 'password123',
      rememberMe: true
    }).subscribe({
      next: () => {
        // ✓ Tokens saved automatically
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error(error.error.message);
      }
    });
  }
}
```

### Register User
```typescript
export class SignupComponent {
  private authService = inject(AuthService);

  onSubmit() {
    this.authService.register({
      userName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    }).subscribe({
      next: () => {
        // ✓ Tokens saved automatically
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
```

### Check If Logged In
```typescript
export class NavbarComponent {
  readonly authService = inject(AuthService);

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  logout() {
    this.authService.logout();
    // ✓ Tokens cleared
    // ✓ Redirected to login
  }
}
```

### In Template
```html
<!-- Show if logged in -->
<div *ngIf="authService.isLoggedIn()">
  Welcome {{ authService.currentUser()?.firstName }}!
</div>

<!-- Show if not logged in -->
<div *ngIf="!authService.isLoggedIn()">
  Please login
</div>
```

### Make Protected API Call
```typescript
// Interceptor automatically adds token
this.http.get('/api/users').subscribe(
  (data) => {
    console.log(data); // Success ✓
  },
  (error) => {
    // If 401: interceptor handles refresh automatically
    // If refresh fails: redirects to login
  }
);
```

---

## 🔑 Tokens

### Access Token
- 💾 Stored in: `localStorage['accessToken']`
- ⏱️ Expires: ~15 minutes
- 📍 Used for: API requests (sent in Authorization header)
- 🔄 Auto-refreshed when expired

### Refresh Token
- 💾 Stored in: `localStorage['refreshToken']`
- ⏱️ Expires: ~7 days
- 📍 Used for: Getting new access token
- 🔄 Sent to `/api/auth/refresh` endpoint

---

## 🔄 Automatic Flows

### Login Flow
```
User clicks Login
  ↓
POST /api/auth/login (email, password)
  ↓
Backend validates
  ├─ ✓ Returns tokens + user
  │   ↓ Saved to localStorage
  │   ↓ Redirect dashboard
  │
  └─ ✗ Invalid
      ↓ Show error
```

### Request Flow (Automatic Token)
```
this.http.get('/api/users')
  ↓
Interceptor adds token:
  Authorization: Bearer {accessToken}
  ↓
Server processes
  ├─ ✓ 200: Return data
  │
  └─ ✗ 401: Token expired
      ↓
      Interceptor refresh:
        POST /api/auth/refresh {refreshToken}
        ↓
        ├─ ✓ Returns new token
        │   ├─ Save new token
        │   ├─ Retry request
        │   └─ Return data
        │
        └─ ✗ Refresh also expired
            ├─ Clear tokens
            └─ Redirect login
```

### Logout Flow
```
User clicks Logout
  ↓
authService.logout()
  ├─ POST /api/auth/logout (revoke token)
  ├─ Clear localStorage
  ├─ Clear user state
  └─ Redirect login
```

---

## 🛡️ Security - What's Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Access Token | ✅ | ~15 min expiry |
| Refresh Token | ✅ | ~7 days expiry |
| Auto Refresh | ✅ | On 401 error |
| Token Injection | ✅ | Interceptor |
| Logout Revoke | ✅ | Backend API call |
| Password Validation | ✅ | Min 8 chars, 1 uppercase |
| Error Handling | ✅ | Show user-friendly messages |

---

## ⚠️ Security - Can Improve

- [ ] httpOnly Cookies (instead of localStorage)
- [ ] HTTPS only enforcement
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] 2FA/MFA
- [ ] Password strength meter
- [ ] Session timeout warnings

---

## 🧪 Test with cURL

### Login
```bash
curl -X POST http://localhost:4200/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "rememberMe": true
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Protected Request
```bash
curl -X GET http://localhost:4200/api/users \
  -H "Authorization: Bearer {accessToken}"
```

### Refresh Token
```bash
curl -X POST http://localhost:4200/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

### Logout
```bash
curl -X POST http://localhost:4200/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "{refreshToken}"
  }'
```

---

## 🔍 Debug in Browser

### Check Tokens
```javascript
// In DevTools Console
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('currentUser')
```

### Decode Token
```javascript
// In DevTools Console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
// { user_id, email, exp, iat, ... }
```

### Check Auth State
```javascript
// In DevTools Console
console.log(authService.isLoggedIn())  // boolean
console.log(authService.currentUser()) // user object
```

### Monitor Network Requests
```
Chrome DevTools → Network Tab
- Look for: POST /auth/login
- Look for: Authorization header in requests
- Look for: POST /auth/refresh (if token expired)
- Look for: 401 responses
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tokens not saved | Check `authService.login()` returns tokens |
| Token not in header | Check interceptor is registered in `app.ts` |
| 401 keeps happening | Check refresh token is valid, not expired |
| Logout doesn't work | Check tokens cleared from localStorage |
| Form won't submit | Check form validation, touch all fields |
| API call fails with 401 | Check interceptor catches and refreshes |

---

## 📚 Documentation Files

1. **JWT_AUTHENTICATION_GUIDE.md** - Complete architecture & concepts
2. **IMPLEMENTATION_EXAMPLES.ts** - Code samples & patterns
3. **SETUP_AND_CONFIG.md** - Setup guide & checklist
4. **ARCHITECTURE.md** - System overview & flows
5. **QUICK_REFERENCE.md** - This file (quick lookup)

---

## 🚀 Quick Commands

```bash
# Test login
npm start
# Go to http://localhost:4200/login
# Enter credentials
# Should redirect to dashboard

# Check tokens in console
localStorage.getItem('accessToken')

# Logout
# Should clear tokens and redirect to login

# Make API call
# Should automatically include Authorization header
# If token expired, should auto-refresh
```

---

## 📞 API Endpoints

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | /auth/login | email, password, rememberMe | accessToken, refreshToken, user |
| POST | /auth/register | userName, email, password, role | accessToken, refreshToken, user |
| POST | /auth/refresh | refreshToken | accessToken, refreshToken, user |
| POST | /auth/logout | refreshToken | - |
| GET | /auth/me | - | user |
| POST | /auth/forgot-password | email | - |
| POST | /auth/reset-password | token, newPassword | - |
| PATCH | /auth/change-password | currentPassword, newPassword | - |

---

## ✅ Status

```
✅ Login implemented & tested
✅ Signup implemented & tested
✅ Token storage working
✅ Token refresh working
✅ Interceptor gapping token
✅ Error handling working
✅ Logout working
✅ Documentation complete

❌ Auth guard for routes (TODO - add if needed)
❌ Password reset UI (backend ready)
❌ 2FA implementation (future)
❌ httpOnly cookies (future enhancement)
```

---

## 🎓 Learning Path

1. **Start here**: This file (overview)
2. **Understand flow**: ARCHITECTURE.md (flows & diagrams)
3. **See examples**: IMPLEMENTATION_EXAMPLES.ts (code samples)
4. **Deep dive**: JWT_AUTHENTICATION_GUIDE.md (detailed explanation)
5. **Setup guide**: SETUP_AND_CONFIG.md (configuration & checklist)

---

**All systems operational! 🎉**

Ready to use in production after:
1. Backend integration
2. HTTPS setup
3. CORS configuration
4. Testing on real data

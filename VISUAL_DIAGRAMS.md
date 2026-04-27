# 🔐 JWT Authentication - Visual Diagrams

## 1️⃣ Login Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      USER LOGIN FLOW                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │  Login Page  │
     │   Component  │
     └──────┬───────┘
            │
            │ User enters email & password
            │ Clicks "Login" button
            │
            ▼
     ┌──────────────────────┐
     │  Form Validation     │
     │  - Email required    │
     │  - Password > 8 char │
     └──────┬───────────────┘
            │
            ├─ Invalid? ─► Show error ✗
            │
            └─ Valid? ─► Continue
                       │
                       ▼
            ┌──────────────────────┐
            │ AuthService.login()  │
            └──────┬───────────────┘
                   │
                   ▼
            ┌──────────────────────────┐
            │ POST /api/auth/login     │
            │ {email, password}        │
            └──────┬───────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   ✓ 200 OK              ✗ 401/400
   │                     │
   │ Response:           │ Error response
   │ {                   │ {
   │   accessToken,      │   message: "Invalid..."
   │   refreshToken,     │ }
   │   user              │
   │ }                   │ ▼
   │                     │ Set errorMessage
   │ ▼                   │ Show toast
   │ AuthTokenService    │
   │ .setTokens()        │ ✗ FAILED
   │ │
   │ ├─ localStorage['accessToken'] = token
   │ ├─ localStorage['refreshToken'] = token
   │ └─ localStorage['currentUser'] = user
   │
   ▼
   authService._currentUser.set(user)
   │
   ▼
   ✓ SUCCESS
   │
   ▼
   router.navigate(['/dashboard'])
   │
   ▼
   ✓ LOGGED IN
```

---

## 2️⃣ API Request Flow with Token

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           AUTHENTICATED REQUEST FLOW                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

    Component makes HTTP request:
    this.http.get('/api/users')
    │
    ▼
    ┌─────────────────────────────────┐
    │  AuthInterceptor Runs           │
    └──────┬──────────────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ Get Access Token         │
    │ from localStorage        │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────────┐
    │ Clone request + Add Header   │
    │ Authorization: Bearer {token}│
    └──────┬───────────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │ Send to Backend          │
    │ GET /api/users           │
    │ [Authorization header]   │
    └──────┬───────────────────┘
           │
    ┌──────┴──────────────────┐
    │                         │
    ▼                         ▼
 ✓ 200 OK              ✗ 401 Unauthorized
 │                     │ (Token expired)
 │ Response: {data}    │
 │                     │ ▼
 │                     │ Interceptor catches
 │                     │ (catchError)
 │                     │
 │                     ▼
 │                     AuthService.refreshToken()
 │                     POST /api/auth/refresh
 │                     {refreshToken}
 │                     │
 │                  ┌──┴──────────┐
 │                  │             │
 │                  ▼             ▼
 │               ✓ 200         ✗ 401/Error
 │               │             │
 │               │ New tokens  │ Refresh also
 │               │             │ expired
 │               ▼             │
 │               Save new      ▼
 │               token to      Clear localStorage
 │               localStorage  Set _currentUser = null
 │               │             router.navigate(['/login'])
 │               ▼             │
 │               Retry orig.   ✗ NEED LOGIN
 │               request with  │
 │               new token     │
 │               │             │
 │               ▼             │
 │               ✓ 200         │
 │               │             │
 │               ▼             │
 │               Return data   │
 │               to component  │
 │                             │
 ▼                             ▼
Return data                  Redirect login
✓ SUCCESS                    ✗ NEED AUTH
```

---

## 3️⃣ Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                  TOKEN LIFECYCLE                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                    LOGIN
                      │
                      ▼
        ┌─────────────────────────┐
        │ ACCESS TOKEN CREATED    │
        │ Expires: 15 minutes     │
        │                         │
        │ ┌───────────────────┐   │
        │ │ Valid for API     │   │
        │ │ requests          │   │
        │ └───────────────────┘   │
        └────────┬────────────────┘
                 │
        ┌────────▼────────┐
        │ Time Passing... │
        │ 14 min, 13 min..│
        └────────┬────────┘
                 │
        ┌────────▼──────────────┐
        │ ~14:59 remaining      │
        │ Still valid ✓         │
        │ Can use for requests  │
        └────────┬──────────────┘
                 │
        ┌────────▼──────────────┐
        │ ~0:01 remaining       │
        │ EXPIRED! ✗            │
        │ Request returns 401   │
        └────────┬──────────────┘
                 │
        ┌────────▼────────────────────────┐
        │ Interceptor auto-refresh:       │
        │ POST /auth/refresh              │
        │ + send RefreshToken             │
        │                                 │
        │ ┌──────────────────────────┐   │
        │ │ Is RefreshToken valid?   │   │
        │ │ (expires in 7 days)      │   │
        │ └──────────┬───────────────┘   │
        │            │                   │
        │       ┌────┴─────┐             │
        │       │           │            │
        │       ▼           ▼            │
        │      ✓ YES      ✗ NO          │
        │       │           │            │
        │       │           ▼            │
        │       │      Clear all tokens  │
        │       │      Logout user       │
        │       │      → /login          │
        │       │                        │
        │       ▼                        │
        │   Generate NEW Access Token    │
        │   (15 minutes from now)        │
        │   Optionally rotate:           │
        │   Generate NEW Refresh Token   │
        │   (7 days from now)            │
        │                                │
        │   Save both to localStorage    │
        │   ✓                            │
        └────────┬─────────────────────┘
                 │
        ┌────────▼────────────────┐
        │ Retry original request  │
        │ with NEW token          │
        │ SUCCESS ✓               │
        └────────┬────────────────┘
                 │
                 ▼
        Back to using tokens...

        [Cycle repeats every 15 min]
```

---

## 4️⃣ Component Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            COMPONENT & SERVICE ARCHITECTURE                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  Login Component    │
│                     │
│  onSubmit()         │─┐
│  togglePassword()   │ │
│  form validation    │ │
└─────────────────────┘ │
         │              │
         │ inject()     │
         │ AuthService  │
         │              │
         ▼              ▼
    ┌────────────────────────────────┐
    │     AuthService               │
    │                               │
    │  login()     ─┐               │
    │  register()  ├─► inject       │
    │  logout()    │   AuthTokenSvc │
    │  refreshToken()              │
    │  getProfile()                │
    │              │               │
    │  Signals:    │               │
    │  currentUser │               │
    │  isLoggedIn  │               │
    └────────┬──────────────┬──────┘
             │              │
             │              ▼
             │    ┌──────────────────────┐
             │    │ AuthTokenService    │
             │    │                     │
             │    │ getAccessToken()   │
             │    │ getRefreshToken()  │
             │    │ setTokens()        │
             │    │ clear()            │
             │    │                     │
             │    │ Storage:           │
             │    │ localStorage[...]  │
             │    └──────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │    HTTP + Interceptor        │
    │                              │
    │  authInterceptor:            │
    │  ├─ Get token               │
    │  ├─ Add Authorization       │
    │  ├─ Send request            │
    │  ├─ If 401:                 │
    │  │  ├─ refresh              │
    │  │  └─ retry                │
    │  └─ error handling          │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │      Backend API             │
    │                              │
    │  /auth/login                 │
    │  /auth/register              │
    │  /auth/refresh               │
    │  /auth/logout                │
    │  /auth/me                    │
    │  ... other endpoints         │
    │                              │
    │  (Protected with JWT)        │
    └──────────────────────────────┘
```

---

## 5️⃣ Authentication State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           AUTHENTICATION STATE MACHINE                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ┌─────────────────┐
        │                 │
        │  NOT LOGGED IN  │ ◄────────────┐
        │                 │             │
        └────────┬────────┘             │
                 │                      │ logout()
                 │                      │
        login()  │                      │
    register()   │                      │
                 │                      │
                 ▼                      │
        ┌──────────────────────────┐   │
        │                          │   │
        │  Sending credentials    │   │
        │  to server...           │   │
        │                          │   │
        │  (isSubmitting = true)   │   │
        │                          │   │
        └────┬──────┬─────────────┘   │
             │      │                  │
             │      ▼ Success          │
             │  ┌─────────────────┐   │
             │  │                 │   │
             │  │  LOGGED IN      │───┘
             │  │                 │
             │  │ Save tokens:    │
             │  │ ├─ accessToken  │
             │  │ ├─ refreshToken │
             │  │ └─ currentUser  │
             │  │                 │
             │  │ isLoggedIn = true
             │  │                 │
             │  └────────┬────────┘
             │           │
             │ Error ✗   │ Can use app ✓
             │           │
             ▼           └──► Make API calls
        ┌──────────────┐     (auto token inject)
        │              │
        │ SHOW ERROR   │     API returns 401?
        │              │        │
        │ - Clear form │        ▼
        │ - Show toast │     Auto refresh token
        │              │        │
        │              │     Success? Retry ✓
        │              │     or Redirect login ✗
        │              │
        └──────┬───────┘
               │
               ▼
        Return to login
        ┌─────────────┐
        │             │
        │ NOT LOGGED  │
        │     IN      │
        │             │
        └─────────────┘
```

---

## 6️⃣ Data Flow in localStorage

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              localStorage DATA STRUCTURE                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Before Login:
┌─────────────────────┐
│   localStorage      │
│                     │
│  (empty)            │
│  {}                 │
└─────────────────────┘

After Successful Login:
┌──────────────────────────────────┐
│        localStorage              │
│                                  │
│ accessToken: "eyJhbGc..."        │ ◄─┐ JWT Header
│                                  │   │ JWT Payload
│ refreshToken: "eyJhbGc..."       │ ◄─┤ JWT Signature
│                                  │   │
│ currentUser: {                   │   │
│   id: "507f...",                 │   │ User profile
│   email: "user@ex.com",          │   │ from backend
│   firstName: "John",             │   │
│   lastName: "Doe"                │   │
│ }                                │   │
│                                  │   │
└──────────────────────────────────┘   │
         ▲                              │
         │                              │
    Set by:                        Decoded:
    AuthTokenService              {
    .setTokens()                    "alg": "HS256",
                                    "typ": "JWT",
    AuthService                     "user_id": "507f...",
    .saveUserToStorage()            "exp": 1630706671,
                                    "iat": 1630703071
                                  }

After Logout:
┌─────────────────────┐
│   localStorage      │
│                     │
│  (cleared)          │
│  {}                 │
│                     │
└─────────────────────┘

    Cleared by:
    AuthTokenService.clear()
```

---

## 7️⃣ Request Headers Evolution

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            HTTP REQUEST HEADERS FLOW                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ Initial Login Request:
   ┌──────────────────────────────┐
   │ POST /api/auth/login         │
   │                              │
   │ Headers:                     │
   │ - Content-Type: application/ │
   │   json                       │
   │                              │
   │ Body:                        │
   │ {                            │
   │   email: "user@ex.com",      │
   │   password: "pass123"        │
   │ }                            │
   │                              │
   │ NO Authorization header!     │
   │ (Not logged in yet)          │
   └──────────────────────────────┘

2️⃣ Subsequent Requests (with token):
   ┌──────────────────────────────┐
   │ GET /api/users               │
   │                              │
   │ Headers:                     │
   │ - Content-Type: application/ │
   │   json                       │
   │ - Authorization:             │
   │   Bearer eyJhbGc...          │ ◄─── Token added
   │                              │     automatically
   │ Body:                        │     by interceptor
   │ (none)                       │
   │                              │
   │ ✓ Token included             │
   │ (logged in now)              │
   └──────────────────────────────┘

3️⃣ When Token Expired (401 response):
   ┌──────────────────────────────┐
   │ POST /api/auth/refresh       │
   │                              │
   │ Headers:                     │
   │ - Content-Type: application/ │
   │   json                       │
   │                              │
   │ Body:                        │
   │ {                            │
   │   refreshToken: "eyJhbGc..." │ ◄─── Refresh token sent
   │ }                            │
   │                              │
   │ Response:                    │
   │ {                            │
   │   accessToken: "new_jwt...",  │ ◄─── New access token
   │   refreshToken: "new_jwt...", │ ◄─── New refresh token
   │   user: {...}                │
   │ }                            │
   └──────────────────────────────┘

4️⃣ Retry Original Request:
   ┌──────────────────────────────┐
   │ GET /api/users (RETRY)       │
   │                              │
   │ Headers:                     │
   │ - Content-Type: application/ │
   │   json                       │
   │ - Authorization:             │
   │   Bearer {NEW_TOKEN}         │ ◄─── Updated token
   │                              │
   │ ✓ Success 200                │
   └──────────────────────────────┘
```

---

## 8️⃣ Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ERROR HANDLING FLOW                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Request made
    │
    ▼
┌────────────────────┐
│ HTTP Response      │
└────┬───────────────┘
     │
  ┌──┴──────────┬──────────┬──────────┬──────────┐
  │             │          │          │          │
  ▼             ▼          ▼          ▼          ▼
200-299      400         401        403        500+
Success      Bad Req    Unauth     Forbidden  Server
│            │          │          │          │
│            │          │          │          │
│        Show error  Try refresh   Show error Show error
│        message     token         message    message
│                       │
│                       ▼
│                  Success?
│                    ├─ Yes ─────┐
│                    │           │
│                    No          ├─► Retry request
│                    │           │   with new token
│                    ▼           │
│              Clear tokens      │
│              Logout            │
│              Redirect /login   │
│              Show message      │
│                                │
├────────────────────────────────┘
│
▼ Return to component

Component:
├─ next(data) ─► Use data
└─ error(err) ─► Show error toast
```

---

## 9️⃣ Complete System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  COMPLETE SYSTEM OVERVIEW                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     BROWSER / FRONTEND                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ANGULAR COMPONENTS                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Login     │  │   Signup    │  │ Dashboard │ │  │
│  │  │ Component   │  │ Component    │  │Component  │ │  │
│  │  └──────┬──────┘  └──────┬───────┘  └────┬──────┘ │  │
│  │         │                │               │         │  │
│  │         └────────────────┼───────────────┘         │  │
│  │                          │                          │  │
│  │                          ▼                          │  │
│  │        ┌─────────────────────────────────┐         │  │
│  │        │     AuthService (Injectable)    │         │  │
│  │        │                                 │         │  │
│  │        │ ├─ login()                      │         │  │
│  │        │ ├─ register()                   │         │  │
│  │        │ ├─ logout()                     │         │  │
│  │        │ ├─ refreshToken()               │         │  │
│  │        │ │                               │         │  │
│  │        │ ├─ Signals:                     │         │  │
│  │        │ │ ├─ currentUser                │         │  │
│  │        │ │ └─ isLoggedIn                 │         │  │
│  │        │                                 │         │  │
│  │        └────────────────┬────────────────┘         │  │
│  │                         │                          │  │
│  │                         ▼                          │  │
│  │        ┌─────────────────────────────────┐         │  │
│  │        │  AuthTokenService (Injectable)  │         │  │
│  │        │                                 │         │  │
│  │        │ ├─ getAccessToken()             │         │  │
│  │        │ ├─ getRefreshToken()            │         │  │
│  │        │ ├─ setTokens()                  │         │  │
│  │        │ └─ clear()                      │         │  │
│  │        │                                 │         │  │
│  │        └────────────────┬────────────────┘         │  │
│  │                         │                          │  │
│  │                         ▼                          │  │
│  │        ┌─────────────────────────────────┐         │  │
│  │        │      Browser localStorage       │         │  │
│  │        │                                 │         │  │
│  │        │ • accessToken                   │         │  │
│  │        │ • refreshToken                  │         │  │
│  │        │ • currentUser                   │         │  │
│  │        └─────────────────────────────────┘         │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            HttpClientModule                         │  │
│  │                  with                                │  │
│  │         authInterceptor (HTTP_INTERCEPTORS)         │  │
│  │                                                      │  │
│  │  ├─ Add Authorization header                        │  │
│  │  ├─ Catch 401 errors                                │  │
│  │  ├─ Auto-refresh tokens                             │  │
│  │  └─ Retry requests                                  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTP Requests
                          │ with JWT Authorization
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Authentication Endpoints                   │  │
│  │                                                      │  │
│  │  POST /api/auth/login                               │  │
│  │  ├─ Verify email/password                           │  │
│  │  ├─ Generate JWT tokens                             │  │
│  │  └─ Return tokens + user                            │  │
│  │                                                      │  │
│  │  POST /api/auth/register                            │  │
│  │  ├─ Validate input                                  │  │
│  │  ├─ Create user                                     │  │
│  │  ├─ Generate JWT tokens                             │  │
│  │  └─ Return tokens + user                            │  │
│  │                                                      │  │
│  │  POST /api/auth/refresh                             │  │
│  │  ├─ Verify refresh token                            │  │
│  │  ├─ Generate new access token                       │  │
│  │  └─ Return new tokens                               │  │
│  │                                                      │  │
│  │  POST /api/auth/logout                              │  │
│  │  └─ Revoke refresh token                            │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Protected API Endpoints                        │  │
│  │  (Require valid Authorization header)               │  │
│  │                                                      │  │
│  │  GET /api/users                                     │  │
│  │  GET /api/profile                                   │  │
│  │  POST /api/... (any protected endpoint)             │  │
│  │                                                      │  │
│  │  All check:                                         │  │
│  │  1. Authorization header present?                   │  │
│  │  2. JWT token valid?                                │  │
│  │  3. Token expired?                                  │  │
│  │      ├─ No  ─► Process request                      │  │
│  │      └─ Yes ─► Return 401                           │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Database                               │  │
│  │  • Users table                                       │  │
│  │  • Sessions/RefreshTokens table                      │  │
│  │  • User data                                         │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**All diagrams illustrate the complete JWT authentication flow!** 🎉

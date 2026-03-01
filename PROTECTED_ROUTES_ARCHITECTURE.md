# Protected Routes System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    React App (App.jsx)                  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         useAuthPersist Hook                       │  │    │
│  │  │  • Monitors localStorage changes                  │  │    │
│  │  │  • Syncs logout across tabs                       │  │    │
│  │  │  • Validates localStorage on mount                │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │              React Router                         │  │    │
│  │  │                                                    │  │    │
│  │  │  Public Routes (PublicRoute)                      │  │    │
│  │  │  ├─ /login                                        │  │    │
│  │  │  └─ /register                                     │  │    │
│  │  │                                                    │  │    │
│  │  │  Protected Routes (ProtectedRoute)                │  │    │
│  │  │  ├─ /dashboard                                    │  │    │
│  │  │  ├─ /jobs                                         │  │    │
│  │  │  └─ /profile                                      │  │    │
│  │  │                                                    │  │    │
│  │  │  Role-Based Routes (RoleBasedRoute)               │  │    │
│  │  │  └─ /applications (jobseeker only)                │  │    │
│  │  │                                                    │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  Redux Store                            │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  authSlice                                        │  │    │
│  │  │  • user: { _id, name, email, role, token }       │  │    │
│  │  │  • isLoading, isSuccess, isError, message        │  │    │
│  │  │  • Actions: login, register, logout, reset       │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              localStorage                               │    │
│  │  {                                                      │    │
│  │    "user": {                                            │    │
│  │      "_id": "...",                                      │    │
│  │      "name": "John Doe",                                │    │
│  │      "email": "john@example.com",                       │    │
│  │      "role": "jobseeker",                               │    │
│  │      "token": "eyJhbGc..."                              │    │
│  │    }                                                    │    │
│  │  }                                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Axios Instance (api.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Request Interceptor                                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  1. Read user from localStorage                         │    │
│  │  2. Extract JWT token                                   │    │
│  │  3. Add Authorization header: Bearer <token>            │    │
│  │  4. Handle corrupted localStorage                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  Response Interceptor                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • 401 Unauthorized → Auto-logout + Redirect            │    │
│  │  • 403 Forbidden → Show permission denied               │    │
│  │  • 404 Not Found → Show not found message               │    │
│  │  • 500 Server Error → Show server error                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Server                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Auth Middleware (protect, authorize)                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  1. Extract token from Authorization header             │    │
│  │  2. Verify JWT signature                                │    │
│  │  3. Check token expiration                              │    │
│  │  4. Load user from database                             │    │
│  │  5. Validate user role (if authorize middleware)        │    │
│  │  6. Attach user to req.user                             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
│  API Endpoints                                                   │
│  • POST /api/auth/register                                       │
│  • POST /api/auth/login                                          │
│  • GET  /api/auth/profile (protected)                            │
│  • GET  /api/jobs (public)                                       │
│  • POST /api/jobs (employer only)                                │
│  • POST /api/applications/:jobId (jobseeker only)                │
│  • GET  /api/applications/my (protected)                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Flow Diagrams

### 1. ProtectedRoute Flow

```
User navigates to /dashboard
         │
         ▼
┌─────────────────────┐
│  ProtectedRoute     │
│  Component          │
└─────────────────────┘
         │
         ▼
   Check Redux state
   for user object
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  User?     No User
    │         │
    │         ▼
    │    Navigate to /login
    │    (save current location)
    │
    ▼
Render children
(Dashboard component)
```

### 2. RoleBasedRoute Flow

```
User navigates to /applications
         │
         ▼
┌─────────────────────┐
│  RoleBasedRoute     │
│  allowedRoles:      │
│  ['jobseeker']      │
└─────────────────────┘
         │
         ▼
   Check Redux state
   for user object
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  User?     No User
    │         │
    │         ▼
    │    Navigate to /login
    │
    ▼
Check user.role in
allowedRoles array
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Match?   No Match
    │         │
    │         ▼
    │    Navigate to /dashboard
    │
    ▼
Render children
(Applications component)
```

### 3. useAuth Hook Flow

```
Component calls useAuth()
         │
         ▼
┌─────────────────────┐
│  useAuth Hook       │
└─────────────────────┘
         │
         ▼
Get user from Redux state
         │
         ▼
Check if token exists
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Token?   No Token
    │         │
    │         ▼
    │    Return isAuthenticated: false
    │
    ▼
Decode JWT token
(extract payload)
         │
         ▼
Check expiration time
(payload.exp * 1000)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
Expired?   Valid
    │         │
    │         ▼
    │    Return isAuthenticated: true
    │    + user, hasRole, hasAnyRole, logout
    │
    ▼
Dispatch logout()
Navigate to /login
Return isAuthenticated: false
```

### 4. API Request Flow

```
Component makes API call
(e.g., getJobs())
         │
         ▼
┌─────────────────────┐
│  Axios Instance     │
│  Request            │
│  Interceptor        │
└─────────────────────┘
         │
         ▼
Read localStorage['user']
         │
         ▼
Extract token
         │
         ▼
Add Authorization header:
Bearer <token>
         │
         ▼
Send request to backend
         │
         ▼
┌─────────────────────┐
│  Backend validates  │
│  JWT token          │
└─────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Valid?   Invalid
    │         │
    │         ▼
    │    Return 401 Unauthorized
    │         │
    │         ▼
    │    ┌─────────────────────┐
    │    │  Axios Response     │
    │    │  Interceptor        │
    │    └─────────────────────┘
    │         │
    │         ▼
    │    Clear localStorage
    │    Show toast notification
    │    Navigate to /login
    │
    ▼
Return data to component
```

### 5. Cross-Tab Sync Flow

```
Tab A: User clicks logout
         │
         ▼
Dispatch logout action
         │
         ▼
localStorage.removeItem('user')
         │
         ▼
Browser fires 'storage' event
         │
         ▼
┌─────────────────────┐
│  Tab B: Listening   │
│  via useAuthPersist │
└─────────────────────┘
         │
         ▼
Detect 'user' key removed
         │
         ▼
Dispatch logout action
         │
         ▼
Tab B: User logged out
```

## Data Flow

### Login Flow
```
1. User submits login form
   └─> POST /api/auth/login
       └─> Backend validates credentials
           └─> Returns { user, token }
               └─> authService stores in localStorage
                   └─> Redux state updated
                       └─> Navigate to intended destination
```

### Protected Route Access
```
1. User navigates to /dashboard
   └─> ProtectedRoute checks Redux state
       └─> User exists?
           ├─> Yes: Render Dashboard
           └─> No: Navigate to /login
```

### Token Expiration
```
1. Component calls useAuth()
   └─> Hook decodes JWT token
       └─> Check expiration
           └─> Expired?
               ├─> Yes: Auto-logout + Navigate to /login
               └─> No: Return user data
```

### API Error Handling
```
1. API request fails with 401
   └─> Axios response interceptor catches error
       └─> Clear localStorage
           └─> Show toast notification
               └─> Navigate to /login (after 1s delay)
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Frontend Route Protection                     │
│  • ProtectedRoute component                             │
│  • RoleBasedRoute component                             │
│  • Prevents unauthorized navigation                     │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Token Validation                              │
│  • useAuth hook checks token expiration                 │
│  • Auto-logout on expired token                         │
│  • Prevents stale authentication                        │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: API Interceptor                               │
│  • Auto-injects JWT token                               │
│  • Handles 401 errors globally                          │
│  • Prevents unauthorized API calls                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Backend Middleware                            │
│  • protect middleware verifies JWT                      │
│  • authorize middleware checks role                     │
│  • Final security validation                            │
└─────────────────────────────────────────────────────────┘
```

## Key Takeaways

1. **Multi-layered Security**: Frontend + Backend validation
2. **Automatic Token Management**: No manual token handling needed
3. **Seamless UX**: Auto-logout, redirects, notifications
4. **Cross-Tab Sync**: Consistent state across browser tabs
5. **Clean Architecture**: Reusable components and hooks
6. **Comprehensive Error Handling**: All error cases covered

---

This architecture ensures secure, maintainable, and user-friendly authentication! 🔒

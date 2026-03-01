# Protected Routes System - Complete Guide

## Overview

The SkillMatch application implements a comprehensive protected routes system with:
- ✅ Authentication-based route protection
- ✅ Role-based access control
- ✅ Automatic token validation
- ✅ Auto-logout on token expiration
- ✅ Auth state persistence via localStorage
- ✅ Cross-tab synchronization
- ✅ Redirect to intended destination after login

## Architecture

### Components

#### 1. ProtectedRoute Component
**Location**: `frontend/src/components/ProtectedRoute.jsx`

Protects routes that require authentication. Redirects unauthenticated users to login.

```jsx
<ProtectedRoute>
  <MainLayout>
    <Dashboard />
  </MainLayout>
</ProtectedRoute>
```

**Features**:
- Checks if user is authenticated
- Saves intended destination for post-login redirect
- Redirects to `/login` if not authenticated

#### 2. PublicRoute Component
**Location**: `frontend/src/components/PublicRoute.jsx`

For routes that should only be accessible when NOT authenticated (login, register).

```jsx
<PublicRoute>
  <Login />
</PublicRoute>
```

**Features**:
- Redirects authenticated users to dashboard
- Prevents logged-in users from accessing login/register pages

#### 3. RoleBasedRoute Component
**Location**: `frontend/src/components/RoleBasedRoute.jsx`

Restricts access based on user role.

```jsx
<RoleBasedRoute allowedRoles={['jobseeker']}>
  <MainLayout>
    <Applications />
  </MainLayout>
</RoleBasedRoute>
```

**Props**:
- `allowedRoles`: Array of roles that can access the route
- `redirectTo`: Where to redirect if access denied (default: `/dashboard`)

**Features**:
- Checks user authentication first
- Validates user role against allowed roles
- Redirects unauthorized users

### Hooks

#### 1. useAuth Hook
**Location**: `frontend/src/hooks/useAuth.js`

Provides authentication utilities and token validation.

```jsx
const { user, isAuthenticated, hasRole, hasAnyRole, logout } = useAuth();
```

**Returns**:
- `user`: Current user object
- `isAuthenticated`: Boolean indicating auth status
- `hasRole(role)`: Check if user has specific role
- `hasAnyRole(roles)`: Check if user has any of the roles
- `logout()`: Logout function

**Features**:
- Validates JWT token expiration
- Auto-logout on expired token
- Role checking utilities

#### 2. useAuthPersist Hook
**Location**: `frontend/src/hooks/useAuthPersist.js`

Monitors localStorage for auth changes across browser tabs.

```jsx
useAuthPersist(); // Call in App.jsx
```

**Features**:
- Syncs logout across tabs
- Validates localStorage data on mount
- Handles corrupted localStorage data

### API Interceptor

**Location**: `frontend/src/services/api.js`

Enhanced Axios interceptor with comprehensive error handling.

**Request Interceptor**:
- Automatically injects JWT token from localStorage
- Handles corrupted localStorage data

**Response Interceptor**:
- 401 Unauthorized: Auto-logout and redirect to login
- 403 Forbidden: Permission denied notification
- 404 Not Found: Resource not found notification
- 500 Server Error: Server error notification

## Usage Examples

### Basic Protected Route

```jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  } 
/>
```

### Role-Based Route

```jsx
// Only jobseekers can access
<Route 
  path="/applications" 
  element={
    <RoleBasedRoute allowedRoles={['jobseeker']}>
      <MainLayout>
        <Applications />
      </MainLayout>
    </RoleBasedRoute>
  } 
/>

// Only employers can access
<Route 
  path="/manage-jobs" 
  element={
    <RoleBasedRoute allowedRoles={['employer']}>
      <MainLayout>
        <ManageJobs />
      </MainLayout>
    </RoleBasedRoute>
  } 
/>

// Multiple roles allowed
<Route 
  path="/admin" 
  element={
    <RoleBasedRoute allowedRoles={['admin', 'employer']}>
      <MainLayout>
        <AdminPanel />
      </MainLayout>
    </RoleBasedRoute>
  } 
/>
```

### Public Route (Auth Pages)

```jsx
<Route 
  path="/login" 
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  } 
/>
```

### Using useAuth Hook in Components

```jsx
import useAuth from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, hasRole, hasAnyRole, logout } = useAuth();

  // Check authentication
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  // Check specific role
  if (hasRole('employer')) {
    return <EmployerDashboard />;
  }

  // Check multiple roles
  if (hasAnyRole(['admin', 'employer'])) {
    return <ManagementPanel />;
  }

  // Logout
  const handleLogout = () => {
    logout();
  };

  return <div>Welcome {user.name}</div>;
}
```

### Conditional Rendering Based on Role

```jsx
import useAuth from '../hooks/useAuth';

function Navigation() {
  const { hasRole } = useAuth();

  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/jobs">Jobs</Link>
      
      {hasRole('jobseeker') && (
        <Link to="/applications">My Applications</Link>
      )}
      
      {hasRole('employer') && (
        <Link to="/manage-jobs">Manage Jobs</Link>
      )}
    </nav>
  );
}
```

## Authentication Flow

### Login Flow

1. User submits login form
2. API call to `/api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token + user data
5. Frontend stores in localStorage
6. Redux state updated
7. User redirected to intended destination (or dashboard)

### Auto-Logout Flow

1. User makes API request
2. Backend validates JWT token
3. If token expired/invalid → 401 response
4. Axios interceptor catches 401
5. localStorage cleared
6. Toast notification shown
7. User redirected to login page

### Cross-Tab Sync Flow

1. User logs out in Tab A
2. localStorage 'user' key removed
3. Storage event fired
4. Tab B's useAuthPersist hook detects change
5. Tab B dispatches logout action
6. Tab B user logged out automatically

## Token Validation

### JWT Token Structure

```javascript
{
  header: { alg: "HS256", typ: "JWT" },
  payload: {
    id: "user_id",
    exp: 1234567890, // Expiration timestamp
    iat: 1234567890  // Issued at timestamp
  },
  signature: "..."
}
```

### Token Expiration Check

```javascript
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    return Date.now() >= expiryTime;
  } catch (error) {
    return true;
  }
};
```

## localStorage Structure

```javascript
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Security Features

### 1. Token Auto-Injection
- JWT token automatically added to all API requests
- No manual token management needed

### 2. Token Validation
- Token expiration checked on every auth hook call
- Expired tokens trigger automatic logout

### 3. Corrupted Data Handling
- localStorage data validated on mount
- Corrupted data automatically cleared

### 4. Cross-Tab Synchronization
- Logout in one tab logs out all tabs
- Prevents stale authentication state

### 5. Role-Based Access Control
- Routes restricted by user role
- Unauthorized access redirected

### 6. Secure Redirects
- Intended destination preserved
- Users redirected after login
- Prevents navigation loops

## Error Handling

### 401 Unauthorized
```javascript
// Automatic handling in api.js
if (status === 401) {
  localStorage.removeItem('user');
  toast.error('Session expired. Please login again.');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
}
```

### 403 Forbidden
```javascript
if (status === 403) {
  toast.error('You do not have permission to perform this action.');
}
```

### Role Mismatch
```javascript
// In RoleBasedRoute component
if (!allowedRoles.includes(user.role)) {
  return <Navigate to={redirectTo} replace />;
}
```

## Best Practices

### 1. Always Use Route Components
```jsx
// ✅ Good
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// ❌ Bad - Manual checks
<Route path="/dashboard" element={
  user ? <Dashboard /> : <Navigate to="/login" />
} />
```

### 2. Use useAuth Hook for Conditional Logic
```jsx
// ✅ Good
const { hasRole } = useAuth();
if (hasRole('employer')) { ... }

// ❌ Bad - Direct Redux access
const { user } = useSelector(state => state.auth);
if (user.role === 'employer') { ... }
```

### 3. Enable Auth Persistence
```jsx
// In App.jsx
function App() {
  useAuthPersist(); // Always call this
  return <Routes>...</Routes>;
}
```

### 4. Handle Redirects Properly
```jsx
// ✅ Good - Preserve intended destination
const from = location.state?.from?.pathname || '/dashboard';
navigate(from, { replace: true });

// ❌ Bad - Always redirect to dashboard
navigate('/dashboard');
```

### 5. Validate Roles on Backend
```javascript
// Frontend role checks are for UX only
// Always validate on backend
router.post('/jobs', protect, authorize('employer'), createJob);
```

## Testing Scenarios

### 1. Test Authentication
- [ ] Unauthenticated user redirected to login
- [ ] Authenticated user can access protected routes
- [ ] Login redirects to intended destination

### 2. Test Role-Based Access
- [ ] Jobseeker can access applications page
- [ ] Employer cannot access applications page
- [ ] Employer can access manage jobs page
- [ ] Jobseeker cannot access manage jobs page

### 3. Test Token Expiration
- [ ] Expired token triggers auto-logout
- [ ] User redirected to login
- [ ] Toast notification shown

### 4. Test Cross-Tab Sync
- [ ] Logout in one tab logs out other tabs
- [ ] Auth state synced across tabs

### 5. Test Error Handling
- [ ] 401 error triggers logout
- [ ] 403 error shows permission denied
- [ ] Corrupted localStorage handled gracefully

## Troubleshooting

### Issue: User not redirected after login
**Solution**: Check if `useLocation` is used in Login component to get `from` state.

### Issue: Token not added to requests
**Solution**: Verify localStorage has 'user' key with 'token' property.

### Issue: Auto-logout not working
**Solution**: Ensure `useAuth` hook is called in components that need validation.

### Issue: Cross-tab sync not working
**Solution**: Verify `useAuthPersist` is called in App.jsx.

### Issue: Role-based route not working
**Solution**: Check user.role matches allowedRoles array values exactly.

## File Structure

```
frontend/src/
├── components/
│   ├── ProtectedRoute.jsx      # Auth-based protection
│   ├── PublicRoute.jsx          # Reverse protection
│   └── RoleBasedRoute.jsx       # Role-based protection
├── hooks/
│   ├── useAuth.js               # Auth utilities
│   └── useAuthPersist.js        # Cross-tab sync
├── services/
│   └── api.js                   # Enhanced interceptors
├── features/
│   └── auth/
│       └── authSlice.js         # Auth state management
└── App.jsx                      # Route configuration
```

## Summary

The protected routes system provides:
- ✅ Secure authentication-based routing
- ✅ Role-based access control
- ✅ Automatic token validation
- ✅ Cross-tab synchronization
- ✅ Comprehensive error handling
- ✅ Clean, reusable components
- ✅ Excellent developer experience

All authentication logic is centralized, making it easy to maintain and extend.

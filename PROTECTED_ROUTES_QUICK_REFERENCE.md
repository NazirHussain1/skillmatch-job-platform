# Protected Routes - Quick Reference

## Components

### ProtectedRoute
Requires authentication. Redirects to login if not authenticated.

```jsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

### PublicRoute
Only accessible when NOT authenticated. Redirects to dashboard if logged in.

```jsx
<PublicRoute>
  <Login />
</PublicRoute>
```

### RoleBasedRoute
Requires specific role(s). Redirects if role doesn't match.

```jsx
<RoleBasedRoute allowedRoles={['employer', 'admin']}>
  <YourComponent />
</RoleBasedRoute>
```

## Hooks

### useAuth
```jsx
const { 
  user,              // Current user object
  isAuthenticated,   // Boolean: is user logged in?
  hasRole,           // Function: hasRole('employer')
  hasAnyRole,        // Function: hasAnyRole(['admin', 'employer'])
  logout             // Function: logout()
} = useAuth();
```

### useAuthPersist
```jsx
// Call once in App.jsx
useAuthPersist();
```

## Common Patterns

### Protected Route with Layout
```jsx
<Route path="/dashboard" element={
  <ProtectedRoute>
    <MainLayout>
      <Dashboard />
    </MainLayout>
  </ProtectedRoute>
} />
```

### Role-Based Navigation
```jsx
const { hasRole } = useAuth();

{hasRole('employer') && <Link to="/manage-jobs">Manage Jobs</Link>}
{hasRole('jobseeker') && <Link to="/applications">Applications</Link>}
```

### Conditional Rendering
```jsx
const { hasAnyRole } = useAuth();

{hasAnyRole(['admin', 'employer']) && (
  <button>Admin Feature</button>
)}
```

### Manual Logout
```jsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

## User Roles

- `jobseeker` - Can browse and apply for jobs
- `employer` - Can post and manage jobs
- `admin` - Full access (future)

## Auto-Logout Triggers

- Token expired (checked by useAuth hook)
- 401 response from API (handled by axios interceptor)
- Logout in another tab (handled by useAuthPersist)
- Corrupted localStorage data

## localStorage Structure

```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "token": "eyJhbGc..."
  }
}
```

## Files

```
components/
├── ProtectedRoute.jsx    # Auth protection
├── PublicRoute.jsx       # Reverse protection
└── RoleBasedRoute.jsx    # Role protection

hooks/
├── useAuth.js            # Auth utilities
└── useAuthPersist.js     # Cross-tab sync

services/
└── api.js                # Auto token injection
```

## Quick Setup

1. Wrap routes in App.jsx:
```jsx
import ProtectedRoute from './components/ProtectedRoute';
import useAuthPersist from './hooks/useAuthPersist';

function App() {
  useAuthPersist();
  
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

2. Use in components:
```jsx
import useAuth from '../hooks/useAuth';

function MyComponent() {
  const { user, hasRole } = useAuth();
  
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      {hasRole('employer') && <EmployerFeature />}
    </div>
  );
}
```

That's it! 🚀

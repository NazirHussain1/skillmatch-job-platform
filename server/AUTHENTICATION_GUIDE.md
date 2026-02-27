# Authentication & Security Guide

## ✅ Fully Implemented Features

### 1. JWT Authentication ✅
- **Access Tokens**: 15-minute expiry, Bearer token in Authorization header
- **Refresh Tokens**: 7-day expiry, stored in httpOnly cookies
- **Token Types**: Separate access and refresh token types with validation
- **Token Rotation**: Automatic refresh token rotation on renewal
- **Token Blacklist**: Redis-backed blacklist for revoked tokens

**Implementation:**
- `src/utils/tokenManager.js` - Token generation, verification, rotation
- `src/utils/tokenBlacklist.js` - Redis-backed token blacklist
- `src/middlewares/auth.js` - JWT verification middleware

### 2. Token Expiration ✅
- **Access Token**: 15 minutes (configurable via `JWT_EXPIRE`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_EXPIRE`)
- **Automatic Cleanup**: Blacklisted tokens auto-removed after expiry
- **Token Validation**: Checks expiration on every request

### 3. Protected Routes ✅
All sensitive routes are protected with `protect` middleware:

**User Routes** (`/api/users/*`):
- ✅ `PUT /profile` - Update profile
- ✅ `GET /analytics` - Get user analytics

**Upload Routes** (`/api/uploads/*`):
- ✅ `POST /resume` - Upload resume (Job Seekers only)
- ✅ `DELETE /resume` - Delete resume
- ✅ `POST /logo` - Upload company logo (Employers only)
- ✅ `DELETE /logo` - Delete logo

**Search History** (`/api/search/*`):
- ✅ `GET /history` - Get search history
- ✅ `DELETE /history` - Clear all search history
- ✅ `DELETE /history/:id` - Delete specific search

**Profile & Settings**:
- ✅ All user profile operations
- ✅ All notification operations
- ✅ All application operations
- ✅ All analytics operations

### 4. Refresh Token Support ✅
- **Endpoint**: `POST /api/auth/refresh`
- **Cookie-based**: Refresh token stored in httpOnly cookie
- **Token Rotation**: New refresh token issued on each refresh
- **Automatic Invalidation**: Old refresh tokens invalidated
- **Secure Storage**: httpOnly, secure (production), sameSite: strict

**Flow:**
```
1. User logs in → Receives access + refresh tokens
2. Access token expires (15min) → Frontend calls /refresh
3. Backend validates refresh token → Issues new token pair
4. Old refresh token invalidated → New tokens returned
```

### 5. Secure Password Hashing (bcrypt) ✅
- **Algorithm**: bcrypt with 10 salt rounds
- **Pre-save Hook**: Automatic hashing before saving to database
- **Password Comparison**: Secure comparison method
- **Never Exposed**: Password field excluded from queries by default
- **Password Change Tracking**: `lastPasswordChange` timestamp

**Implementation:**
```javascript
// In user.model.js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.lastPasswordChange = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### 6. Authentication Middleware ✅
**File**: `src/middlewares/auth.js`

**Middleware Functions:**

#### `protect` - JWT Verification
```javascript
// Protects routes requiring authentication
router.use(protect);
```

**Features:**
- Extracts Bearer token from Authorization header
- Verifies token signature and expiration
- Checks token blacklist (for logged out tokens)
- Attaches user object to request
- Handles all error cases

#### `authorize(...roles)` - Role-Based Access Control
```javascript
// Restricts access to specific roles
router.post('/jobs', protect, authorize('EMPLOYER'), createJob);
```

**Roles:**
- `candidate` - Job seekers
- `employer` - Companies posting jobs
- `admin` - Platform administrators

---

## Security Features

### Additional Security Measures ✅

1. **Token Blacklist**
   - Redis-backed for horizontal scaling
   - Automatic expiry after token lifetime
   - Prevents use of logged-out tokens

2. **Brute Force Protection**
   - Login attempt tracking
   - Account lockout after 5 failed attempts
   - 30-minute lockout duration
   - Automatic unlock after timeout

3. **Account Security**
   - Email verification support
   - Password reset tokens (10-minute expiry)
   - 2FA support (6-digit codes, 10-minute expiry)
   - Account suspension capability
   - Soft delete for data retention

4. **Audit Trail**
   - Last login timestamp
   - Last password change timestamp
   - Login attempt tracking
   - Correlation IDs for request tracing

5. **Cookie Security**
   - httpOnly (prevents XSS)
   - secure flag (HTTPS only in production)
   - sameSite: strict (prevents CSRF)
   - Path restriction (/api/auth/refresh)

---

## Usage Examples

### 1. Protecting a Route

```javascript
import { protect, authorize } from '../../middlewares/auth.js';

// Protect all routes in router
router.use(protect);

// Protect specific route
router.get('/profile', protect, getProfile);

// Protect with role authorization
router.post('/jobs', protect, authorize('EMPLOYER'), createJob);

// Multiple roles
router.get('/analytics', protect, authorize('EMPLOYER', 'ADMIN'), getAnalytics);
```

### 2. Accessing User in Controller

```javascript
export const getProfile = asyncHandler(async (req, res) => {
  // User automatically attached by protect middleware
  const userId = req.user._id;
  const userRole = req.user.role;
  
  // Your logic here
});
```

### 3. Token Refresh Flow

**Frontend:**
```javascript
// When access token expires (401 error)
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Send httpOnly cookie
});

const { accessToken } = await response.json();
// Use new access token for subsequent requests
```

**Backend:**
```javascript
// Automatically handled by auth.controller.js
export const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  const result = await authService.refreshToken(oldRefreshToken, req.correlationId);
  
  // Set new refresh token cookie
  tokenManager.setRefreshTokenCookie(res, result.refreshToken);
  
  res.json(ApiResponse.success({ token: result.accessToken }));
});
```

### 4. Logout (Token Blacklisting)

```javascript
export const logout = asyncHandler(async (req, res) => {
  // Access token automatically blacklisted
  // Refresh token invalidated
  await authService.logout(req.user._id, req.token, req.correlationId);
  
  // Clear refresh token cookie
  tokenManager.clearRefreshTokenCookie(res);
  
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});
```

---

## Protected Routes Summary

### Authentication Routes
- `POST /api/auth/logout` ✅ Protected
- `GET /api/auth/me` ✅ Protected

### User Routes (All Protected)
- `PUT /api/users/profile` ✅
- `GET /api/users/analytics` ✅

### Job Routes
- `GET /api/jobs/employer/my-jobs` ✅ Protected (Employer only)
- `POST /api/jobs` ✅ Protected (Employer only)
- `PUT /api/jobs/:id` ✅ Protected (Employer only)
- `DELETE /api/jobs/:id` ✅ Protected (Employer only)

### Application Routes (All Protected)
- `GET /api/applications` ✅ (Job Seeker only)
- `GET /api/applications/employer` ✅ (Employer only)
- `POST /api/applications` ✅ (Job Seeker only)
- `PUT /api/applications/:id` ✅ (Employer only)
- `DELETE /api/applications/:id` ✅

### Upload Routes (All Protected)
- `POST /api/uploads/resume` ✅ (Job Seeker only)
- `DELETE /api/uploads/resume` ✅
- `POST /api/uploads/logo` ✅ (Employer only)
- `DELETE /api/uploads/logo` ✅

### Search History (Protected)
- `GET /api/search/history` ✅
- `DELETE /api/search/history` ✅
- `DELETE /api/search/history/:id` ✅

### Notification Routes (All Protected)
- `GET /api/notifications` ✅
- `PUT /api/notifications/:id/read` ✅
- `PUT /api/notifications/read-all` ✅
- `DELETE /api/notifications/:id` ✅

### Analytics Routes (All Protected)
- `GET /api/analytics/employer` ✅ (Employer only)
- `GET /api/analytics/admin` ✅ (Admin only)
- `POST /api/analytics/job/:id/view` ✅

### Matching Routes (All Protected)
- `GET /api/matching/skill-gap/:jobId` ✅ (Job Seeker only)
- `GET /api/matching/job-recommendations` ✅ (Job Seeker only)
- `GET /api/matching/candidate-recommendations/:jobId` ✅ (Employer only)

---

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_REFRESH_EXPIRE=7d

# Security
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=1800000  # 30 minutes in milliseconds
```

---

## Security Best Practices Implemented

1. ✅ **Short-lived access tokens** (15 minutes)
2. ✅ **Long-lived refresh tokens** (7 days) in httpOnly cookies
3. ✅ **Token rotation** on refresh
4. ✅ **Token blacklist** for logout
5. ✅ **Bcrypt password hashing** (10 salt rounds)
6. ✅ **Password never exposed** in API responses
7. ✅ **Role-based access control** (RBAC)
8. ✅ **Brute force protection** (account lockout)
9. ✅ **Secure cookies** (httpOnly, secure, sameSite)
10. ✅ **Token type validation** (access vs refresh)
11. ✅ **Correlation IDs** for audit trail
12. ✅ **Structured logging** for security events
13. ✅ **Redis-backed blacklist** for horizontal scaling
14. ✅ **Email verification** support
15. ✅ **Password reset** with expiring tokens
16. ✅ **2FA support** ready

---

## Testing Authentication

### 1. Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "candidate"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Cookie: refreshToken=YOUR_REFRESH_TOKEN"
```

### 5. Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Troubleshooting

### "Not authorized, no token provided"
- Ensure Authorization header is present: `Authorization: Bearer <token>`
- Check token is not expired (15 minutes for access tokens)

### "Token has been revoked"
- Token was blacklisted (user logged out)
- Use refresh token to get new access token

### "Invalid refresh token"
- Refresh token expired (7 days)
- Refresh token was rotated (old token invalidated)
- User needs to login again

### "User role X is not authorized"
- Route requires specific role (e.g., EMPLOYER)
- Check user role matches required role

---

## Summary

✅ **All authentication security features are fully implemented:**
- JWT authentication with access & refresh tokens
- Token expiration (15min access, 7d refresh)
- All sensitive routes protected
- Refresh token support with rotation
- Bcrypt password hashing (10 salt rounds)
- Authentication middleware (`protect`, `authorize`)
- Token blacklist for logout
- Role-based access control
- Brute force protection
- Secure cookie handling
- Comprehensive audit trail

**Status:** Production-ready, enterprise-grade authentication system.

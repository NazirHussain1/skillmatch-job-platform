# Authentication System Documentation

## Overview
Complete JWT-based authentication system with role-based authorization.

## Features
✅ User registration with password hashing (bcrypt)
✅ User login with JWT token generation
✅ Protected routes with JWT verification
✅ Role-based authorization (admin, employer, jobseeker)
✅ No sessions - stateless JWT authentication

## Routes

### 1. Register User
**Endpoint:** `POST /api/auth/register`
**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "jobseeker"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- Name: Required, 2-50 characters
- Email: Required, valid email format, unique
- Password: Required, minimum 6 characters
- Role: Optional, must be 'admin', 'employer', or 'jobseeker' (default: 'jobseeker')

**Errors:**
- 400: User already exists
- 400: Invalid user data
- 400: Validation errors

---

### 2. Login User
**Endpoint:** `POST /api/auth/login`
**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation:**
- Email: Required, valid email format
- Password: Required

**Errors:**
- 401: Invalid email or password
- 400: Validation errors

---

### 3. Get Profile
**Endpoint:** `GET /api/auth/profile`
**Access:** Private (requires JWT token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "createdAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": "2026-03-02T10:30:00.000Z"
  }
}
```

**Errors:**
- 401: Not authorized, no token provided
- 401: Not authorized, token failed
- 404: User not found

---

## Middleware

### 1. protect
Verifies JWT token and attaches user to request object.

**Usage:**
```javascript
router.get('/protected', protect, controller);
```

**How it works:**
1. Extracts token from Authorization header (Bearer token)
2. Verifies token using JWT_SECRET
3. Finds user by decoded ID
4. Attaches user to req.user
5. Calls next() if successful

**Errors:**
- 401: No token provided
- 401: Invalid token
- 404: User not found

---

### 2. authorize(...roles)
Restricts access to specific roles.

**Usage:**
```javascript
// Single role
router.post('/jobs', protect, authorize('employer'), createJob);

// Multiple roles
router.delete('/jobs/:id', protect, authorize('employer', 'admin'), deleteJob);
```

**How it works:**
1. Checks if req.user.role is in allowed roles
2. Returns 403 if not authorized
3. Calls next() if authorized

**Errors:**
- 403: User role not authorized

---

## JWT Token

### Generation
Tokens are generated using `generateToken(userId)` utility.

**Configuration (.env):**
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Token Payload:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1709377800,
  "exp": 1709982600
}
```

### Token Usage
Include token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Password Security

### Hashing
Passwords are hashed using bcrypt with salt rounds of 10.

**Implementation:**
```javascript
// Pre-save hook in User model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

### Password Verification
```javascript
// Method in User model
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

---

## Role-Based Access Control

### Roles
- `admin` - Full system access
- `employer` - Can post jobs, manage applications
- `jobseeker` - Can apply to jobs

### Examples

**Employer-only route:**
```javascript
router.post('/jobs', protect, authorize('employer'), createJob);
```

**Admin-only route:**
```javascript
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
```

**Multiple roles:**
```javascript
router.put('/jobs/:id', protect, authorize('employer', 'admin'), updateJob);
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "jobseeker"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with Postman

### 1. Register User
- Method: POST
- URL: `http://localhost:5000/api/auth/register`
- Body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "jobseeker"
}
```

### 2. Login User
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- Copy the token from response

### 3. Get Profile
- Method: GET
- URL: `http://localhost:5000/api/auth/profile`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer YOUR_TOKEN_HERE`

---

## Security Best Practices

✅ Passwords hashed with bcrypt (never stored in plain text)
✅ JWT tokens expire after 7 days
✅ Tokens verified on every protected route
✅ Password field excluded from queries by default
✅ Email validation and uniqueness enforced
✅ Role validation with enum
✅ HTTPS recommended for production
✅ JWT_SECRET stored in environment variables

---

## Error Handling

All authentication errors return consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 401
}
```

**Common Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid credentials or token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found

---

## Flow Diagrams

### Registration Flow
```
Client → POST /api/auth/register
       → Validate input
       → Check if user exists
       → Hash password (bcrypt)
       → Create user in database
       → Generate JWT token
       → Return user data + token
```

### Login Flow
```
Client → POST /api/auth/login
       → Validate input
       → Find user by email
       → Compare password (bcrypt)
       → Generate JWT token
       → Return user data + token
```

### Protected Route Flow
```
Client → GET /api/auth/profile (with token)
       → Extract token from header
       → Verify token (JWT)
       → Find user by decoded ID
       → Attach user to request
       → Execute route handler
       → Return response
```

---

## Environment Variables

Required in `.env`:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Important:**
- Use a strong, random JWT_SECRET in production
- Never commit .env file to version control
- Minimum 32 characters recommended for JWT_SECRET

---

## Files Structure

```
backend/
├── controllers/
│   └── auth.controller.js       # Register, login, getProfile
├── middleware/
│   └── auth.middleware.js       # protect, authorize
├── models/
│   └── User.model.js            # User schema with password hashing
├── routes/
│   └── auth.routes.js           # Auth routes
├── validators/
│   └── auth.validator.js        # Input validation
└── utils/
    └── generateToken.js         # JWT token generation
```

---

**Status:** ✅ Complete JWT Authentication System
**Date:** March 2, 2026

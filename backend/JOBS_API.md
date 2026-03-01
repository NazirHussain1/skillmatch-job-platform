# Jobs CRUD API Documentation

## Overview
Complete CRUD operations for job management with role-based access control.

## Routes

### 1. Get All Jobs
**Endpoint:** `GET /api/jobs`
**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "description": "We are looking for an experienced software engineer...",
      "location": "San Francisco, CA",
      "salary": 150000,
      "employer": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Employer",
        "email": "john@techcorp.com"
      },
      "createdAt": "2026-03-02T10:30:00.000Z",
      "updatedAt": "2026-03-02T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Get Single Job
**Endpoint:** `GET /api/jobs/:id`
**Access:** Public

**Parameters:**
- `id` - Job ID (MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "We are looking for an experienced software engineer...",
    "location": "San Francisco, CA",
    "salary": 150000,
    "employer": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Employer",
      "email": "john@techcorp.com"
    },
    "createdAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": "2026-03-02T10:30:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid job ID format
- 404: Job not found

---

### 3. Create Job
**Endpoint:** `POST /api/jobs`
**Access:** Private (Employer only)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "description": "We are looking for an experienced software engineer with 5+ years of experience...",
  "location": "San Francisco, CA",
  "salary": 150000
}
```

**Validation:**
- `title` - Required, string
- `company` - Required, string
- `description` - Required, string
- `location` - Required, string
- `salary` - Required, number

**Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "We are looking for an experienced software engineer...",
    "location": "San Francisco, CA",
    "salary": 150000,
    "employer": "507f1f77bcf86cd799439012",
    "createdAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": "2026-03-02T10:30:00.000Z"
  }
}
```

**Errors:**
- 400: Validation errors
- 401: Not authenticated
- 403: Not authorized (not an employer)

---

### 4. Update Job
**Endpoint:** `PUT /api/jobs/:id`
**Access:** Private (Employer only - must be job owner)

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Job ID (MongoDB ObjectId)

**Request Body (all fields optional):**
```json
{
  "title": "Lead Software Engineer",
  "company": "Tech Corp Inc",
  "description": "Updated description...",
  "location": "Remote",
  "salary": 180000
}
```

**Validation:**
- `title` - Optional, string (if provided, cannot be empty)
- `company` - Optional, string (if provided, cannot be empty)
- `description` - Optional, string (if provided, cannot be empty)
- `location` - Optional, string (if provided, cannot be empty)
- `salary` - Optional, number

**Response (200):**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Lead Software Engineer",
    "company": "Tech Corp Inc",
    "description": "Updated description...",
    "location": "Remote",
    "salary": 180000,
    "employer": "507f1f77bcf86cd799439012",
    "createdAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": "2026-03-02T11:00:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid job ID or validation errors
- 401: Not authenticated
- 403: Not authorized (not the job owner)
- 404: Job not found

---

### 5. Delete Job
**Endpoint:** `DELETE /api/jobs/:id`
**Access:** Private (Employer only - must be job owner)

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Job ID (MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011"
  }
}
```

**Errors:**
- 400: Invalid job ID format
- 401: Not authenticated
- 403: Not authorized (not the job owner)
- 404: Job not found

---

## Authorization

### Employer Role Required
Only users with `role: "employer"` can:
- Create jobs (POST /api/jobs)
- Update jobs (PUT /api/jobs/:id) - only their own
- Delete jobs (DELETE /api/jobs/:id) - only their own

### Ownership Check
For UPDATE and DELETE operations:
- The authenticated user must be the job owner
- Checked by comparing `job.employer` with `req.user._id`

---

## Testing with cURL

### Get All Jobs
```bash
curl -X GET http://localhost:5000/api/jobs
```

### Get Single Job
```bash
curl -X GET http://localhost:5000/api/jobs/507f1f77bcf86cd799439011
```

### Create Job (requires employer token)
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "We are looking for an experienced software engineer...",
    "location": "San Francisco, CA",
    "salary": 150000
  }'
```

### Update Job (requires employer token and ownership)
```bash
curl -X PUT http://localhost:5000/api/jobs/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN" \
  -d '{
    "title": "Lead Software Engineer",
    "salary": 180000
  }'
```

### Delete Job (requires employer token and ownership)
```bash
curl -X DELETE http://localhost:5000/api/jobs/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_EMPLOYER_TOKEN"
```

---

## Testing with Postman

### Setup
1. Create an employer account:
   - POST /api/auth/register
   - Body: `{ "name": "John", "email": "john@example.com", "password": "password123", "role": "employer" }`
   - Copy the token from response

2. Set Authorization header for protected routes:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN`

### Test Sequence

**1. Create Job**
- Method: POST
- URL: `http://localhost:5000/api/jobs`
- Headers: Authorization: Bearer YOUR_TOKEN
- Body (JSON):
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "description": "We are looking for an experienced software engineer with 5+ years of experience in Node.js and React.",
  "location": "San Francisco, CA",
  "salary": 150000
}
```

**2. Get All Jobs**
- Method: GET
- URL: `http://localhost:5000/api/jobs`
- No auth required

**3. Get Single Job**
- Method: GET
- URL: `http://localhost:5000/api/jobs/JOB_ID`
- No auth required

**4. Update Job**
- Method: PUT
- URL: `http://localhost:5000/api/jobs/JOB_ID`
- Headers: Authorization: Bearer YOUR_TOKEN
- Body (JSON):
```json
{
  "salary": 180000,
  "location": "Remote"
}
```

**5. Delete Job**
- Method: DELETE
- URL: `http://localhost:5000/api/jobs/JOB_ID`
- Headers: Authorization: Bearer YOUR_TOKEN

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Job title is required"
    },
    {
      "field": "salary",
      "message": "Salary must be a number"
    }
  ],
  "statusCode": 400
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Not authorized, no token provided",
  "statusCode": 401
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Not authorized to update this job",
  "statusCode": 403
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Job not found",
  "statusCode": 404
}
```

---

## Controller Implementation

### Clean & Short Controllers
Each controller function:
- Uses `asyncHandler` wrapper (no try-catch)
- Returns consistent `ApiResponse` format
- Includes proper status codes
- Validates ownership for protected operations
- Populates employer data on GET requests

### Example Controller Pattern
```javascript
const controllerFunction = asyncHandler(async (req, res) => {
  // 1. Get data from database
  const data = await Model.find();
  
  // 2. Check conditions
  if (!data) {
    return res.status(404).json(
      ApiResponse.error('Not found', 404)
    );
  }
  
  // 3. Return response
  return res.status(200).json(
    ApiResponse.success('Success message', data)
  );
});
```

---

## Middleware Flow

### Public Routes (GET /api/jobs, GET /api/jobs/:id)
```
Request → Validator → Controller → Response
```

### Protected Routes (POST, PUT, DELETE)
```
Request → protect → authorize('employer') → Validator → Controller → Response
```

### Ownership Check (PUT, DELETE)
```
Controller checks: job.employer === req.user._id
```

---

## Database Schema

```javascript
{
  title: String (required),
  company: String (required),
  description: String (required),
  location: String (required),
  salary: Number (required),
  employer: ObjectId (ref: User, required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Best Practices

✅ **Clean Controllers**
- Short and focused
- Single responsibility
- No duplicate logic
- Consistent error handling

✅ **Input Validation**
- All inputs validated
- Clear error messages
- Type checking
- Required field validation

✅ **Role-Based Access**
- Employer-only for create/update/delete
- Ownership verification
- Clear authorization errors

✅ **Clean JSON Responses**
- Consistent format
- Proper status codes
- Meaningful messages
- No sensitive data

✅ **Security**
- JWT authentication
- Ownership verification
- Input sanitization
- Proper error messages

---

## Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not authorized for this resource)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (handled by error middleware)

---

**Status:** ✅ Complete CRUD Implementation
**Date:** March 2, 2026
**Access Control:** Role-Based (Employer only for write operations)

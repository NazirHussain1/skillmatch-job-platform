# Applications API Documentation

## Overview
Complete application management system with role-based access control, duplicate prevention, and proper MongoDB population.

## Routes

### 1. Create Application
**Endpoint:** `POST /api/applications/:jobId`
**Access:** Private (Jobseeker only)

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `jobId` - Job ID (MongoDB ObjectId)

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "salary": 150000
    },
    "applicant": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "pending",
    "createdAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": "2026-03-02T10:30:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid job ID format
- 400: Already applied to this job
- 401: Not authenticated
- 403: Not a jobseeker
- 404: Job not found

**Features:**
- ✅ Validates job existence
- ✅ Prevents duplicate applications (unique index)
- ✅ Auto-assigns applicant from JWT token
- ✅ Populates job and applicant data

---

### 2. Get My Applications
**Endpoint:** `GET /api/applications/my`
**Access:** Private (Any authenticated user)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "job": {
        "_id": "507f1f77bcf86cd799439012",
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "salary": 150000
      },
      "applicant": "507f1f77bcf86cd799439013",
      "status": "pending",
      "createdAt": "2026-03-02T10:30:00.000Z",
      "updatedAt": "2026-03-02T10:30:00.000Z"
    }
  ]
}
```

**Features:**
- ✅ Returns applications for current user
- ✅ Sorted by creation date (newest first)
- ✅ Populates job details

---

### 3. Get Job Applications
**Endpoint:** `GET /api/applications/job/:jobId`
**Access:** Private (Employer only - must be job owner)

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `jobId` - Job ID (MongoDB ObjectId)

**Response (200):**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "job": "507f1f77bcf86cd799439012",
      "applicant": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "createdAt": "2026-03-02T10:30:00.000Z",
      "updatedAt": "2026-03-02T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- 400: Invalid job ID format
- 401: Not authenticated
- 403: Not authorized (not the job owner)
- 404: Job not found

**Features:**
- ✅ Validates job existence
- ✅ Verifies job ownership
- ✅ Populates applicant data
- ✅ Sorted by creation date

---

### 4. Update Application Status
**Endpoint:** `PUT /api/applications/:id`
**Access:** Private (Employer only - must be job owner)

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` - Application ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Validation:**
- `status` - Required, must be: `pending`, `accepted`, or `rejected`

**Response (200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job": {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "salary": 150000
    },
    "applicant": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "accepted",
    "createdAt": "2026-03-02T10:30:00.000Z",
    "updatedAt": "2026-03-02T11:00:00.000Z"
  }
}
```

**Errors:**
- 400: Invalid application ID or status
- 401: Not authenticated
- 403: Not authorized (not the job owner)
- 404: Application not found

**Features:**
- ✅ Validates application existence
- ✅ Verifies job ownership
- ✅ Updates status only
- ✅ Returns populated data

---

## Authorization

### Jobseeker Role
- Can create applications (POST /api/applications/:jobId)
- Can view own applications (GET /api/applications/my)

### Employer Role
- Can view applications for own jobs (GET /api/applications/job/:jobId)
- Can update application status (PUT /api/applications/:id)
- Must be the job owner

### Ownership Verification
- Create: Auto-assigned from JWT token
- Get job applications: Checks job.employer === user._id
- Update status: Checks job.employer === user._id

---

## Duplicate Prevention

### Unique Index
```javascript
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
```

### Behavior
- MongoDB enforces uniqueness at database level
- Prevents duplicate applications automatically
- Returns 400 error if duplicate detected

### Error Response
```json
{
  "success": false,
  "message": "You have already applied to this job",
  "statusCode": 400
}
```

---

## MongoDB Population

### Create Application
Populates:
- `job` - title, company, location, salary
- `applicant` - name, email

### Get My Applications
Populates:
- `job` - title, company, location, salary

### Get Job Applications
Populates:
- `applicant` - name, email

### Update Application Status
Populates:
- `job` - title, company, location, salary
- `applicant` - name, email

---

## Testing with cURL

### Create Application (Jobseeker)
```bash
curl -X POST http://localhost:5000/api/applications/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer JOBSEEKER_TOKEN"
```

### Get My Applications
```bash
curl -X GET http://localhost:5000/api/applications/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Job Applications (Employer)
```bash
curl -X GET http://localhost:5000/api/applications/job/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer EMPLOYER_TOKEN"
```

### Update Application Status (Employer)
```bash
curl -X PUT http://localhost:5000/api/applications/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer EMPLOYER_TOKEN" \
  -d '{"status": "accepted"}'
```

---

## Testing with Postman

### Setup
1. Create jobseeker account:
   - POST /api/auth/register
   - Body: `{ "name": "John", "email": "john@example.com", "password": "password123", "role": "jobseeker" }`
   - Copy jobseeker token

2. Create employer account:
   - POST /api/auth/register
   - Body: `{ "name": "Jane", "email": "jane@example.com", "password": "password123", "role": "employer" }`
   - Copy employer token

3. Create a job (as employer):
   - POST /api/jobs
   - Copy job ID

### Test Sequence

**1. Apply to Job (Jobseeker)**
- Method: POST
- URL: `http://localhost:5000/api/applications/JOB_ID`
- Headers: Authorization: Bearer JOBSEEKER_TOKEN

**2. Get My Applications (Jobseeker)**
- Method: GET
- URL: `http://localhost:5000/api/applications/my`
- Headers: Authorization: Bearer JOBSEEKER_TOKEN

**3. Get Job Applications (Employer)**
- Method: GET
- URL: `http://localhost:5000/api/applications/job/JOB_ID`
- Headers: Authorization: Bearer EMPLOYER_TOKEN

**4. Update Application Status (Employer)**
- Method: PUT
- URL: `http://localhost:5000/api/applications/APPLICATION_ID`
- Headers: Authorization: Bearer EMPLOYER_TOKEN
- Body (JSON):
```json
{
  "status": "accepted"
}
```

**5. Try Duplicate Application (Should Fail)**
- Method: POST
- URL: `http://localhost:5000/api/applications/JOB_ID`
- Headers: Authorization: Bearer JOBSEEKER_TOKEN
- Expected: 400 error

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "status",
      "message": "Status must be pending, accepted, or rejected"
    }
  ],
  "statusCode": 400
}
```

### Duplicate Application (400)
```json
{
  "success": false,
  "message": "You have already applied to this job",
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
  "message": "Not authorized to view applications for this job",
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

### Clean Error Handling
- Uses `asyncHandler` wrapper (no try-catch)
- Consistent `ApiResponse` format
- Proper status codes
- Meaningful error messages

### Job Existence Validation
```javascript
const job = await Job.findById(jobId);
if (!job) {
  return res.status(404).json(
    ApiResponse.error('Job not found', 404)
  );
}
```

### Duplicate Prevention
```javascript
const existingApplication = await Application.findOne({
  job: jobId,
  applicant: req.user._id
});

if (existingApplication) {
  return res.status(400).json(
    ApiResponse.error('You have already applied to this job', 400)
  );
}
```

### Ownership Verification
```javascript
if (job.employer.toString() !== req.user._id.toString()) {
  return res.status(403).json(
    ApiResponse.error('Not authorized to view applications for this job', 403)
  );
}
```

---

## Database Schema

```javascript
{
  job: ObjectId (ref: Job, required),
  applicant: ObjectId (ref: User, required),
  status: String (enum: ['pending', 'accepted', 'rejected'], default: 'pending'),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Unique index
{ job: 1, applicant: 1 } (unique)
```

---

## Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, duplicate, invalid ID)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (not jobseeker/employer or not owner)
- `404` - Not Found (job/application doesn't exist)
- `500` - Server Error (handled by error middleware)

---

## Application Status Flow

```
pending → accepted
        → rejected
```

**Status Values:**
- `pending` - Initial status (default)
- `accepted` - Application accepted by employer
- `rejected` - Application rejected by employer

---

## Best Practices

✅ **Duplicate Prevention**
- Unique compound index at database level
- Additional check in controller
- Clear error message

✅ **Job Validation**
- Checks job existence before creating application
- Returns 404 if job not found
- Prevents orphaned applications

✅ **MongoDB Population**
- Populates only needed fields
- Reduces data transfer
- Improves performance

✅ **Clean Error Handling**
- Consistent error format
- Proper status codes
- Meaningful messages
- No stack traces in production

✅ **Role-Based Access**
- Jobseeker can only apply
- Employer can only view/update own job applications
- Clear authorization errors

---

## Files Structure

```
backend/
├── controllers/
│   └── application.controller.js  # ✅ 4 clean functions
├── routes/
│   └── application.routes.js      # ✅ 4 routes
├── validators/
│   └── application.validator.js   # ✅ 3 validators
└── models/
    └── Application.model.js       # ✅ Schema with unique index
```

---

**Status:** ✅ Complete Application System
**Date:** March 2, 2026
**Features:** Duplicate prevention, job validation, MongoDB population, clean error handling

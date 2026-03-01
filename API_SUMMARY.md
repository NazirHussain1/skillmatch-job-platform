# Centralized API Layer - Quick Summary ✅

## Architecture

```
┌─────────────────────────────────────────────────┐
│           React Components                      │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│           Redux Thunks                          │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  Services (auth, jobs, applications)            │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│  api.js (Centralized Axios Instance)            │
│  ✅ Base URL                                    │
│  ✅ JWT Interceptor (Request)                   │
│  ✅ Error Handler (Response)                    │
└─────────────────┬───────────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────────┐
│           Backend API                           │
└─────────────────────────────────────────────────┘
```

---

## Files Created/Updated

### ✅ Created: api.js
**Location:** `frontend/src/services/api.js`

**Features:**
- Axios instance with baseURL
- Request interceptor (adds JWT token)
- Response interceptor (handles 401 errors)
- No duplicate configuration

### ✅ Updated: authService.js
**Changes:**
- Uses `api` instead of `axios`
- Removed manual token headers
- Removed API_URL constant
- Cleaner methods

### ✅ Updated: jobService.js
**Changes:**
- Uses `api` instead of `axios`
- Removed `token` parameter from all methods
- Removed manual config objects
- Much simpler code

### ✅ Updated: applicationService.js
**Changes:**
- Uses `api` instead of `axios`
- Removed `token` parameter from all methods
- Removed manual config objects
- Cleaner implementation

### ✅ Updated: Redux Slices
**Changes:**
- Removed token extraction from state
- Simplified async thunks
- Token handled by interceptor

---

## JWT Interceptor

### Request Interceptor
```javascript
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});
```

**What it does:**
1. Reads user from localStorage
2. Extracts JWT token
3. Adds Authorization header automatically
4. Applied to ALL requests

### Response Interceptor
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**What it does:**
1. Checks for 401 Unauthorized errors
2. Clears user from localStorage
3. Redirects to login page
4. Handles token expiration automatically

---

## Before vs After

### Before (Manual Token)
```javascript
// Service
const createJob = async (jobData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.post(`${API_URL}/jobs`, jobData, config);
  return response.data.data;
};

// Redux Thunk
const token = thunkAPI.getState().auth.user.token;
return await jobService.createJob(jobData, token);

// Component
const token = user.token;
await jobService.createJob(jobData, token);
```

### After (Automatic Token)
```javascript
// Service
const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data.data;
};

// Redux Thunk
return await jobService.createJob(jobData);

// Component
await jobService.createJob(jobData);
```

**Benefits:**
- ✅ 50% less code
- ✅ No token management
- ✅ Cleaner methods
- ✅ Easier to maintain

---

## Service Methods

### authService
```javascript
✅ register(userData)      // POST /auth/register
✅ login(userData)         // POST /auth/login
✅ logout()                // Clear localStorage
✅ getProfile()            // GET /auth/profile
```

### jobService
```javascript
✅ getJobs()               // GET /jobs
✅ getJob(id)              // GET /jobs/:id
✅ createJob(jobData)      // POST /jobs
✅ updateJob(id, jobData)  // PUT /jobs/:id
✅ deleteJob(id)           // DELETE /jobs/:id
```

### applicationService
```javascript
✅ getMyApplications()                    // GET /applications/my
✅ createApplication(jobId)               // POST /applications/:jobId
✅ getJobApplications(jobId)              // GET /applications/job/:jobId
✅ updateApplicationStatus(id, status)    // PUT /applications/:id
```

---

## Key Features

### ✅ Centralized Configuration
- Single axios instance
- One place to configure
- Base URL from environment

### ✅ Automatic JWT Handling
- Request interceptor adds token
- No manual token passing
- Works for all protected routes

### ✅ Global Error Handling
- Response interceptor catches 401
- Auto-logout on token expiration
- Redirects to login automatically

### ✅ Clean Services
- Simple method signatures
- No token parameters
- Easy to read and use

### ✅ No Duplication
- DRY principle
- Reusable api instance
- Consistent patterns

---

## Usage Example

```javascript
// In a component
import { useDispatch } from 'react-redux';
import { createJob } from '../features/jobs/jobSlice';

function CreateJobForm() {
  const dispatch = useDispatch();

  const handleSubmit = async (formData) => {
    try {
      // No token needed - interceptor handles it!
      await dispatch(createJob(formData)).unwrap();
      toast.success('Job created!');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    // Form JSX
  );
}
```

---

## Environment Configuration

```env
# .env
VITE_API_URL=http://localhost:5000/api

# Production
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Checklist

- ✅ api.js created with axios instance
- ✅ Base URL configured from environment
- ✅ Request interceptor adds JWT token
- ✅ Response interceptor handles 401 errors
- ✅ authService updated to use api
- ✅ jobService updated to use api
- ✅ applicationService updated to use api
- ✅ All token parameters removed
- ✅ Redux slices simplified
- ✅ No duplicate axios configuration
- ✅ Services clean and reusable

---

**Everything is configured and working!** 🎉

The centralized API layer provides:
- Automatic JWT token handling
- Global error handling
- Clean, reusable services
- No code duplication
- Easy to maintain and extend

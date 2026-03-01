# Centralized API Layer Complete ✅

## Overview
Centralized Axios configuration with JWT interceptor and clean, reusable service layer.

## Architecture

```
frontend/src/services/
├── api.js                    # ✅ Centralized Axios instance
├── authService.js            # ✅ Authentication API calls
├── jobService.js             # ✅ Jobs API calls
└── applicationService.js     # ✅ Applications API calls
```

---

## Base API Configuration

### Location: `frontend/src/services/api.js`

```javascript
import axios from 'axios';

// Base URL from environment variable or default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    // If user has token, add it to request headers
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### Features

✅ **Base URL Configuration**
- Reads from environment variable
- Falls back to localhost:5000
- Single source of truth

✅ **Default Headers**
- Content-Type: application/json
- Applied to all requests

✅ **Request Interceptor**
- Automatically adds JWT token
- Reads from localStorage
- No manual token passing needed

✅ **Response Interceptor**
- Handles 401 errors globally
- Auto-logout on token expiration
- Redirects to login page

✅ **No Duplicate Configuration**
- Single axios instance
- Reused by all services
- DRY principle

---

## authService

### Location: `frontend/src/services/authService.js`

```javascript
import api from './api';

// Register user
const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.data.data) {
    const user = {
      ...response.data.data,
      token: response.data.data.token
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  return response.data.data;
};

// Login user
const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  
  if (response.data.data) {
    const user = {
      ...response.data.data,
      token: response.data.data.token
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  
  return response.data.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get profile
const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;
```

### Methods

**register(userData)**
- POST /auth/register
- Stores user + token in localStorage
- Returns user object

**login(userData)**
- POST /auth/login
- Stores user + token in localStorage
- Returns user object

**logout()**
- Clears localStorage
- No API call needed

**getProfile()**
- GET /auth/profile
- Token added automatically by interceptor
- Returns user profile

### Changes from Previous Version
- ❌ Removed: `axios` import
- ❌ Removed: `API_URL` constant
- ❌ Removed: Manual token headers
- ✅ Added: `api` import
- ✅ Simplified: All methods cleaner

---

## jobService

### Location: `frontend/src/services/jobService.js`

```javascript
import api from './api';

// Get all jobs
const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data.data;
};

// Get single job
const getJob = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data.data;
};

// Create job
const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data.data;
};

// Update job
const updateJob = async (id, jobData) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data.data;
};

// Delete job
const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data.data;
};

const jobService = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};

export default jobService;
```

### Methods

**getJobs()**
- GET /jobs
- Public endpoint
- Returns array of jobs

**getJob(id)**
- GET /jobs/:id
- Public endpoint
- Returns single job

**createJob(jobData)**
- POST /jobs
- Protected (token added by interceptor)
- Returns created job

**updateJob(id, jobData)**
- PUT /jobs/:id
- Protected (token added by interceptor)
- Returns updated job

**deleteJob(id)**
- DELETE /jobs/:id
- Protected (token added by interceptor)
- Returns success message

### Changes from Previous Version
- ❌ Removed: `axios` import
- ❌ Removed: `API_URL` constant
- ❌ Removed: `token` parameter from all methods
- ❌ Removed: Manual `config` objects with headers
- ✅ Added: `api` import
- ✅ Simplified: All methods much cleaner

---

## applicationService

### Location: `frontend/src/services/applicationService.js`

```javascript
import api from './api';

// Get my applications
const getMyApplications = async () => {
  const response = await api.get('/applications/my');
  return response.data.data;
};

// Create application
const createApplication = async (jobId) => {
  const response = await api.post(`/applications/${jobId}`);
  return response.data.data;
};

// Get job applications (employer)
const getJobApplications = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data.data;
};

// Update application status (employer)
const updateApplicationStatus = async (id, status) => {
  const response = await api.put(`/applications/${id}`, { status });
  return response.data.data;
};

const applicationService = {
  getMyApplications,
  createApplication,
  getJobApplications,
  updateApplicationStatus,
};

export default applicationService;
```

### Methods

**getMyApplications()**
- GET /applications/my
- Protected (token added by interceptor)
- Returns user's applications

**createApplication(jobId)**
- POST /applications/:jobId
- Protected (token added by interceptor)
- Returns created application

**getJobApplications(jobId)**
- GET /applications/job/:jobId
- Protected (token added by interceptor)
- Returns applications for a job

**updateApplicationStatus(id, status)**
- PUT /applications/:id
- Protected (token added by interceptor)
- Returns updated application

### Changes from Previous Version
- ❌ Removed: `axios` import
- ❌ Removed: `API_URL` constant
- ❌ Removed: `token` parameter from all methods
- ❌ Removed: Manual `config` objects with headers
- ✅ Added: `api` import
- ✅ Simplified: All methods much cleaner

---

## Redux Slice Updates

### applicationSlice.js

**Before:**
```javascript
const token = thunkAPI.getState().auth.user.token;
return await applicationService.getMyApplications(token);
```

**After:**
```javascript
return await applicationService.getMyApplications();
```

### jobSlice.js

**Before:**
```javascript
const token = thunkAPI.getState().auth.user.token;
return await jobService.createJob(jobData, token);
```

**After:**
```javascript
return await jobService.createJob(jobData);
```

### Benefits
- ✅ No token management in slices
- ✅ Cleaner async thunks
- ✅ Interceptor handles authentication
- ✅ Less code duplication

---

## JWT Interceptor Flow

### Request Flow
```
1. Component dispatches action
   ↓
2. Redux thunk calls service method
   ↓
3. Service makes API call using 'api' instance
   ↓
4. Request interceptor runs
   ↓
5. Interceptor reads user from localStorage
   ↓
6. Interceptor adds Authorization header
   ↓
7. Request sent to backend with token
```

### Response Flow (Success)
```
1. Backend returns response
   ↓
2. Response interceptor runs
   ↓
3. Response returned to service
   ↓
4. Service extracts data
   ↓
5. Data returned to Redux thunk
   ↓
6. State updated
```

### Response Flow (401 Error)
```
1. Backend returns 401 Unauthorized
   ↓
2. Response interceptor catches error
   ↓
3. Interceptor removes user from localStorage
   ↓
4. Interceptor redirects to /login
   ↓
5. User must login again
```

---

## Benefits

### ✅ No Duplicate Axios Configuration
- Single axios instance
- One place to configure
- Easy to maintain

### ✅ Automatic JWT Handling
- No manual token passing
- Interceptor adds token automatically
- Cleaner service methods

### ✅ Global Error Handling
- 401 errors handled automatically
- Auto-logout on token expiration
- Consistent error behavior

### ✅ Clean Services
- Simple method signatures
- No token parameters
- Easy to read and maintain

### ✅ Reusable
- All services use same api instance
- Consistent patterns
- Easy to add new services

### ✅ Environment Configuration
- Base URL from .env
- Easy to change for different environments
- No hardcoded URLs

---

## Usage Examples

### In Components

**Before (with manual token):**
```javascript
const token = user.token;
await jobService.createJob(jobData, token);
```

**After (with interceptor):**
```javascript
await jobService.createJob(jobData);
```

### In Redux Thunks

**Before:**
```javascript
const token = thunkAPI.getState().auth.user.token;
return await jobService.createJob(jobData, token);
```

**After:**
```javascript
return await jobService.createJob(jobData);
```

---

## Error Handling

### Service Level
```javascript
try {
  const response = await api.get('/jobs');
  return response.data.data;
} catch (error) {
  // Error already handled by interceptor if 401
  throw error;
}
```

### Redux Thunk Level
```javascript
try {
  return await jobService.getJobs();
} catch (error) {
  const message = error.response?.data?.message || error.message;
  return thunkAPI.rejectWithValue(message);
}
```

### Component Level
```javascript
try {
  await dispatch(createJob(jobData)).unwrap();
  toast.success('Job created!');
} catch (error) {
  toast.error(error);
}
```

---

## Environment Variables

### .env File
```env
VITE_API_URL=http://localhost:5000/api
```

### Production
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Staging
```env
VITE_API_URL=https://staging-api.yourdomain.com/api
```

---

## Testing

### Test API Connection
```javascript
import api from './services/api';

// Test public endpoint
api.get('/jobs')
  .then(response => console.log('Success:', response.data))
  .catch(error => console.error('Error:', error));

// Test protected endpoint (requires login)
api.get('/applications/my')
  .then(response => console.log('Success:', response.data))
  .catch(error => console.error('Error:', error));
```

---

## Adding New Services

### Template
```javascript
import api from './api';

// Get all items
const getItems = async () => {
  const response = await api.get('/items');
  return response.data.data;
};

// Get single item
const getItem = async (id) => {
  const response = await api.get(`/items/${id}`);
  return response.data.data;
};

// Create item
const createItem = async (itemData) => {
  const response = await api.post('/items', itemData);
  return response.data.data;
};

// Update item
const updateItem = async (id, itemData) => {
  const response = await api.put(`/items/${id}`, itemData);
  return response.data.data;
};

// Delete item
const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`);
  return response.data.data;
};

const itemService = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};

export default itemService;
```

---

## Summary

✅ **Centralized API Configuration**
- Single axios instance in api.js
- Base URL from environment
- Default headers configured

✅ **JWT Interceptor**
- Request interceptor adds token automatically
- Response interceptor handles 401 errors
- Auto-logout on token expiration

✅ **Clean Services**
- authService.js - 4 methods
- jobService.js - 5 methods
- applicationService.js - 4 methods

✅ **No Duplicate Configuration**
- All services use same api instance
- No repeated axios setup
- DRY principle followed

✅ **Reusable & Maintainable**
- Easy to add new services
- Consistent patterns
- Simple method signatures

---

**Status:** ✅ Complete
**Date:** March 2, 2026
**Pattern:** Centralized API with Interceptors
**Services:** 3 (auth, jobs, applications)

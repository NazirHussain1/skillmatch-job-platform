# Redux Toolkit Configuration ✅

## Overview
Complete Redux Toolkit setup with three slices handling authentication, jobs, and applications with proper loading, success, and error states.

## Store Configuration

### Location: `frontend/src/app/store.js`

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import jobReducer from '../features/jobs/jobSlice';
import applicationReducer from '../features/applications/applicationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    applications: applicationReducer,
  },
});
```

**Features:**
- ✅ Uses `configureStore` from Redux Toolkit
- ✅ Three reducers: auth, jobs, applications
- ✅ No duplicate state logic
- ✅ Clean and simple configuration

---

## Provider Setup

### Location: `frontend/src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

**Features:**
- ✅ Provider wraps entire app
- ✅ Store connected at root level
- ✅ No Context API
- ✅ Clean provider hierarchy

---

## Slice 1: authSlice

### Location: `frontend/src/features/auth/authSlice.js`

### State Structure
```javascript
{
  user: null | { _id, name, email, role, token },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}
```

### Async Thunks

**1. register**
```javascript
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

**2. login**
```javascript
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

**3. logout**
```javascript
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});
```

### Reducers

**reset** - Clears loading, success, error states
```javascript
reset: (state) => {
  state.isLoading = false;
  state.isSuccess = false;
  state.isError = false;
  state.message = '';
}
```

### Extra Reducers (State Handlers)

**register.pending**
```javascript
state.isLoading = true;
```

**register.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.user = action.payload;
```

**register.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
state.user = null;
```

**login.pending**
```javascript
state.isLoading = true;
```

**login.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.user = action.payload;
```

**login.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
state.user = null;
```

**logout.fulfilled**
```javascript
state.user = null;
```

### Usage Example
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';

function LoginComponent() {
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  const handleLogin = (formData) => {
    dispatch(login(formData));
  };

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
    dispatch(reset());
  }, [isError, message, dispatch]);

  return (
    // Component JSX
  );
}
```

---

## Slice 2: jobSlice

### Location: `frontend/src/features/jobs/jobSlice.js`

### State Structure
```javascript
{
  jobs: [],
  job: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}
```

### Async Thunks

**1. getJobs**
```javascript
export const getJobs = createAsyncThunk(
  'jobs/getAll',
  async (filters, thunkAPI) => {
    try {
      return await jobService.getJobs(filters);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

**2. getJob**
```javascript
export const getJob = createAsyncThunk(
  'jobs/get',
  async (id, thunkAPI) => {
    try {
      return await jobService.getJob(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

**3. createJob**
```javascript
export const createJob = createAsyncThunk(
  'jobs/create',
  async (jobData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await jobService.createJob(jobData, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

### Reducers

**reset** - Resets entire state to initial
```javascript
reset: (state) => initialState
```

### Extra Reducers (State Handlers)

**getJobs.pending**
```javascript
state.isLoading = true;
```

**getJobs.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.jobs = action.payload;
```

**getJobs.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
```

**getJob.pending**
```javascript
state.isLoading = true;
```

**getJob.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.job = action.payload;
```

**getJob.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
```

**createJob.pending**
```javascript
state.isLoading = true;
```

**createJob.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.jobs.push(action.payload);
```

**createJob.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
```

### Usage Example
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { getJobs, createJob } from '../features/jobs/jobSlice';

function JobsComponent() {
  const dispatch = useDispatch();
  const { jobs, isLoading, isError, message } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const handleCreateJob = async (jobData) => {
    try {
      await dispatch(createJob(jobData)).unwrap();
      toast.success('Job created!');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    // Component JSX
  );
}
```

---

## Slice 3: applicationSlice

### Location: `frontend/src/features/applications/applicationSlice.js`

### State Structure
```javascript
{
  applications: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}
```

### Async Thunks

**1. getApplications**
```javascript
export const getApplications = createAsyncThunk(
  'applications/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await applicationService.getMyApplications(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

**2. createApplication**
```javascript
export const createApplication = createAsyncThunk(
  'applications/create',
  async (jobId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await applicationService.createApplication(jobId, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);
```

### Reducers

**reset** - Resets entire state to initial
```javascript
reset: (state) => initialState
```

### Extra Reducers (State Handlers)

**getApplications.pending**
```javascript
state.isLoading = true;
```

**getApplications.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.applications = action.payload;
```

**getApplications.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
```

**createApplication.pending**
```javascript
state.isLoading = true;
```

**createApplication.fulfilled**
```javascript
state.isLoading = false;
state.isSuccess = true;
state.applications.push(action.payload);
```

**createApplication.rejected**
```javascript
state.isLoading = false;
state.isError = true;
state.message = action.payload;
```

### Usage Example
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { getApplications, createApplication } from '../features/applications/applicationSlice';

function ApplicationsComponent() {
  const dispatch = useDispatch();
  const { applications, isLoading } = useSelector((state) => state.applications);

  useEffect(() => {
    dispatch(getApplications());
  }, [dispatch]);

  const handleApply = async (jobId) => {
    try {
      await dispatch(createApplication(jobId)).unwrap();
      toast.success('Application submitted!');
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    // Component JSX
  );
}
```

---

## State Management Pattern

### Loading State
```javascript
// Pending
state.isLoading = true;

// Usage in component
{isLoading && <Spinner />}
```

### Success State
```javascript
// Fulfilled
state.isLoading = false;
state.isSuccess = true;
state.data = action.payload;

// Usage in component
{isSuccess && <SuccessMessage />}
```

### Error State
```javascript
// Rejected
state.isLoading = false;
state.isError = true;
state.message = action.payload;

// Usage in component
{isError && <ErrorMessage message={message} />}
```

---

## Best Practices

### ✅ Using createSlice
- Automatically generates action creators
- Reduces boilerplate
- Immutable updates with Immer
- Type-safe reducers

### ✅ Using createAsyncThunk
- Handles async logic
- Automatic pending/fulfilled/rejected actions
- Error handling with try-catch
- Access to thunkAPI (getState, dispatch, etc.)

### ✅ State Structure
- Consistent across all slices
- isLoading, isSuccess, isError, message
- Clear state transitions
- No duplicate logic

### ✅ Token Management
- Token accessed from auth state
- `thunkAPI.getState().auth.user.token`
- Centralized token storage
- No prop drilling

### ✅ Error Handling
- Consistent error extraction
- `error.response?.data?.message || error.message`
- Returned via rejectWithValue
- Displayed in UI via message state

---

## No Context API

✅ **Redux Toolkit replaces Context API**
- Global state management
- Better performance
- DevTools integration
- Time-travel debugging
- Middleware support

❌ **Context API removed**
- No AuthContext
- No JobContext
- No ApplicationContext
- All state in Redux

---

## No Duplicate State Logic

✅ **Single source of truth**
- Each slice manages its domain
- No overlapping state
- Clear separation of concerns
- Predictable state updates

✅ **Reusable patterns**
- Consistent async thunk structure
- Standard error handling
- Common state shape
- Shared best practices

---

## Redux DevTools

### Features Available
- State inspection
- Action history
- Time-travel debugging
- State diff
- Action replay

### Usage
1. Install Redux DevTools extension
2. Open browser DevTools
3. Navigate to Redux tab
4. Inspect state and actions

---

## Complete State Tree

```javascript
{
  auth: {
    user: {
      _id: "...",
      name: "John Doe",
      email: "john@example.com",
      role: "jobseeker",
      token: "eyJhbGc..."
    },
    isLoading: false,
    isSuccess: true,
    isError: false,
    message: ""
  },
  jobs: {
    jobs: [
      {
        _id: "...",
        title: "Senior Software Engineer",
        company: "Tech Corp",
        description: "...",
        location: "San Francisco, CA",
        salary: 150000,
        employer: "...",
        createdAt: "...",
        updatedAt: "..."
      }
    ],
    job: null,
    isLoading: false,
    isSuccess: true,
    isError: false,
    message: ""
  },
  applications: {
    applications: [
      {
        _id: "...",
        job: {
          _id: "...",
          title: "...",
          company: "...",
          location: "...",
          salary: 150000
        },
        applicant: "...",
        status: "pending",
        createdAt: "...",
        updatedAt: "..."
      }
    ],
    isLoading: false,
    isSuccess: true,
    isError: false,
    message: ""
  }
}
```

---

## Summary

✅ **Store Configuration**
- configureStore with 3 reducers
- Clean and simple setup

✅ **Provider Setup**
- Wraps entire app in main.jsx
- Connected at root level

✅ **Three Slices**
- authSlice - Authentication
- jobSlice - Job management
- applicationSlice - Application tracking

✅ **createSlice**
- All slices use createSlice
- Automatic action creators
- Immutable updates

✅ **createAsyncThunk**
- All async operations
- Consistent error handling
- Token management

✅ **State Handling**
- Loading states (pending)
- Success states (fulfilled)
- Error states (rejected)

✅ **No Context API**
- Redux Toolkit only
- Global state management

✅ **No Duplicate Logic**
- Single source of truth
- Consistent patterns
- Reusable structure

---

**Status:** ✅ Complete
**Date:** March 2, 2026
**Library:** Redux Toolkit
**Slices:** 3 (auth, jobs, applications)
**Pattern:** createSlice + createAsyncThunk

# Design Document: Employer Job Management

## Overview

The Employer Job Management feature extends the SkillMatch MERN job platform with a comprehensive frontend interface for employers to manage their job postings and review applications. This design leverages existing backend API endpoints and follows established patterns in the codebase for state management, component architecture, and styling.

### Goals

- Provide employers with a dedicated dashboard to view, create, edit, and delete their job postings
- Enable employers to review applications and update application statuses
- Maintain consistency with existing UI/UX patterns and code architecture
- Ensure responsive design across desktop and mobile devices
- Implement robust state management using Redux Toolkit

### Non-Goals

- Backend API development (already implemented)
- Real-time notifications (future enhancement)
- Advanced analytics or reporting features
- Bulk operations on jobs or applications

## Architecture

### High-Level Architecture

The feature follows a standard React-Redux architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │   My Jobs Page   │         │  Job Applicants Page     │ │
│  │  - Job List      │         │  - Applicant List        │ │
│  │  - Create Modal  │         │  - Status Actions        │ │
│  │  - Edit Modal    │         │  - Filter by Status      │ │
│  │  - Delete Dialog │         │                          │ │
│  └──────────────────┘         └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Redux Store (State)                       │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │   Jobs Slice     │         │  Applications Slice      │ │
│  │  - employerJobs  │         │  - jobApplications       │ │
│  │  - loading       │         │  - loading               │ │
│  │  - error         │         │  - error                 │ │
│  └──────────────────┘         └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │  jobService.js   │         │ applicationService.js    │ │
│  │  - getJobs()     │         │ - getJobApplications()   │ │
│  │  - createJob()   │         │ - updateStatus()         │ │
│  │  - updateJob()   │         │                          │ │
│  │  - deleteJob()   │         │                          │ │
│  └──────────────────┘         └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend REST API                          │
│  - GET    /api/jobs (with employer filter)                   │
│  - POST   /api/jobs                                          │
│  - PUT    /api/jobs/:id                                      │
│  - DELETE /api/jobs/:id                                      │
│  - GET    /api/applications/job/:jobId                       │
│  - PUT    /api/applications/:id                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 with Hooks
- **State Management**: Redux Toolkit with createAsyncThunk
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom utility classes
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios (via centralized api.js)

### Design Patterns

1. **Container/Presenter Pattern**: Pages act as containers managing state and logic, while reusable components handle presentation
2. **Redux Async Thunks**: All API calls wrapped in async thunks for consistent error handling and loading states
3. **Service Layer**: API calls abstracted into service modules for reusability
4. **Route Protection**: RoleBasedRoute component ensures only employers can access management features

## Components and Interfaces

### New Pages

#### 1. MyJobs.jsx

**Purpose**: Main dashboard for employers to manage their job postings

**State Management**:
- Local state for modals (create, edit, delete confirmation)
- Local state for form data
- Redux state for jobs list, loading, and error states

**Key Features**:
- Display grid of employer's jobs with pagination
- Create job modal with form validation
- Edit job modal pre-filled with existing data
- Delete confirmation dialog
- Empty state when no jobs exist
- Application count badge on each job card

**Component Structure**:
```jsx
MyJobs
├── Header (title + "Create Job" button)
├── JobsGrid
│   ├── JobCard (repeated)
│   │   ├── Job details
│   │   ├── Application count badge
│   │   ├── Edit button
│   │   ├── Delete button
│   │   └── View Applicants button
│   └── Pagination
├── CreateJobModal
│   └── JobForm
├── EditJobModal
│   └── JobForm (pre-filled)
└── DeleteConfirmationDialog
```

#### 2. JobApplicants.jsx

**Purpose**: View and manage applications for a specific job

**State Management**:
- URL parameter for jobId
- Redux state for applications list, loading, and error states
- Local state for status filter

**Key Features**:
- Display list of applicants with their information
- Filter by application status (pending, accepted, rejected)
- Accept/Reject action buttons for pending applications
- Display application submission date
- Link to applicant's resume
- Empty state when no applications exist

**Component Structure**:
```jsx
JobApplicants
├── Header (job title + back button)
├── StatusFilter (tabs or dropdown)
├── ApplicantsList
│   └── ApplicantCard (repeated)
│       ├── Applicant info (name, email)
│       ├── Resume link
│       ├── Application date
│       ├── Status badge
│       └── Action buttons (Accept/Reject)
└── EmptyState
```

### Reusable Components

The following existing components will be reused:
- **Pagination**: For job list pagination
- **LoadingSpinner**: For loading states
- **RoleBasedRoute**: For route protection

### New Shared Components

#### JobForm.jsx

**Purpose**: Reusable form component for creating and editing jobs

**Props**:
- `initialData`: Object with job data (empty for create, populated for edit)
- `onSubmit`: Callback function
- `onCancel`: Callback function
- `isLoading`: Boolean for submit button state

**Fields**:
- Title (text input, required)
- Company (text input, required)
- Description (textarea, required)
- Location (text input, required)
- Salary (number input, required)

**Validation**:
- All fields required
- Salary must be positive number
- Client-side validation before submission

#### ConfirmDialog.jsx

**Purpose**: Reusable confirmation dialog for destructive actions

**Props**:
- `isOpen`: Boolean
- `title`: String
- `message`: String
- `confirmText`: String (default: "Confirm")
- `cancelText`: String (default: "Cancel")
- `onConfirm`: Callback function
- `onCancel`: Callback function
- `variant`: "danger" | "warning" | "info"

## Data Models

### Redux State Structure

#### Jobs Slice (Extended)

```javascript
{
  jobs: [],              // All jobs (public view)
  employerJobs: [],      // Employer's own jobs
  job: null,             // Single job details
  pagination: {
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}
```

#### Applications Slice (Extended)

```javascript
{
  applications: [],       // Jobseeker's applications
  jobApplications: [],    // Applications for a specific job (employer view)
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
}
```

### API Request/Response Models

#### Job Object
```javascript
{
  _id: string,
  title: string,
  company: string,
  description: string,
  location: string,
  salary: number,
  employer: string,        // User ID
  createdAt: string,       // ISO date
  updatedAt: string,       // ISO date
  applicationCount: number // Virtual field
}
```

#### Application Object
```javascript
{
  _id: string,
  job: {                   // Populated job object
    _id: string,
    title: string,
    company: string,
    location: string,
    salary: number
  },
  jobseeker: {             // Populated jobseeker object
    _id: string,
    name: string,
    email: string,
    resume: string
  },
  status: 'pending' | 'accepted' | 'rejected',
  createdAt: string,       // ISO date
  updatedAt: string        // ISO date
}
```

### Form Data Models

#### Job Form Data
```javascript
{
  title: string,
  company: string,
  description: string,
  location: string,
  salary: number
}
```

#### Application Status Update
```javascript
{
  status: 'accepted' | 'rejected'
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated:

1. **API Call Properties**: Multiple criteria test that correct API calls are made (POST /jobs, PUT /jobs/:id, DELETE /jobs/:id, etc.). These can be grouped by operation type.
2. **Success/Error Handling**: Multiple criteria test success notifications and error notifications. These follow the same pattern and can be consolidated.
3. **Form Validation**: Multiple criteria test form validation (required fields, submit button state). These can be combined.
4. **Conditional Rendering**: Multiple criteria test that UI elements appear/disappear based on state (action buttons for pending vs non-pending applications, navigation links for employers).
5. **Redux State Updates**: Multiple criteria test that Redux state is updated after operations. These follow the same pattern.

The following properties represent the unique, non-redundant validation requirements:

### Property 1: Employer Job Filtering

*For any* set of jobs in the system, when an employer views their Job Management Dashboard, only jobs where the employer field matches the logged-in user's ID should be displayed.

**Validates: Requirements 1.1**

### Property 2: Job Display Completeness

*For any* job posting, the rendered UI must contain the job's title, company, location, salary, posting date, and application count.

**Validates: Requirements 1.2, 1.3**

### Property 3: Job Sorting Invariant

*For any* list of jobs displayed to an employer, the jobs must be sorted by creation date in descending order (newest first).

**Validates: Requirements 1.5**

### Property 4: Form Validation Completeness

*For any* job form (create or edit), the submit button must be disabled if and only if any required field (title, company, description, location, salary) is empty or invalid.

**Validates: Requirements 2.2, 2.6**

### Property 5: Job Creation Round Trip

*For any* valid job data, when submitted through the create form, the system must send a POST request to /api/jobs with that data, and upon success, the new job must appear in the employer's job list.

**Validates: Requirements 2.3, 2.4, 7.3**

### Property 6: Job Update Round Trip

*For any* existing job and valid update data, when submitted through the edit form, the system must send a PUT request to /api/jobs/:id with that data, and upon success, the job in the list must reflect the updated values.

**Validates: Requirements 3.1, 3.3, 3.4, 7.3**

### Property 7: Job Deletion Consistency

*For any* job in the employer's list, when deletion is confirmed, the system must send a DELETE request to /api/jobs/:id, and upon success, that job must be removed from the displayed list and the Redux store.

**Validates: Requirements 4.3, 4.4, 7.3**

### Property 8: Deletion Cancellation Preserves State

*For any* job, when the delete confirmation dialog is cancelled, the job must remain unchanged in both the UI and the Redux store.

**Validates: Requirements 4.6**

### Property 9: Edit Cancellation Preserves State

*For any* job, when the edit form is cancelled, the job data must remain unchanged in both the UI and the Redux store.

**Validates: Requirements 3.6**

### Property 10: Error Handling Preserves State

*For any* failed API operation (create, update, or delete), the Redux store and UI must remain in their pre-operation state, and an error notification must be displayed.

**Validates: Requirements 2.5, 4.5**

### Property 11: Applicant Display Completeness

*For any* application, the rendered UI must contain the applicant's name, email, resume link, application status, and submission date.

**Validates: Requirements 5.2, 5.3**

### Property 12: Application Status Filtering

*For any* set of applications and any status filter (pending, accepted, rejected), only applications matching that status should be displayed.

**Validates: Requirements 5.5**

### Property 13: Conditional Action Buttons

*For any* application, action buttons (Accept/Reject) must be displayed if and only if the application status is "pending".

**Validates: Requirements 6.1, 6.6**

### Property 14: Application Status Update Round Trip

*For any* pending application, when Accept or Reject is clicked, the system must send a PUT request to /api/applications/:id with the corresponding status, and upon success, the application's status in the UI must be updated and action buttons must be removed.

**Validates: Requirements 6.2, 6.3, 6.4, 7.4**

### Property 15: Redux State Synchronization

*For any* API operation that modifies data (create job, update job, delete job, update application status), the Redux store must be updated to reflect the change before the UI re-renders.

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 16: Loading State Management

*For any* async API operation, the Redux loading state must be true during the operation and false after completion (success or failure).

**Validates: Requirements 7.6, 10.3**

### Property 17: Role-Based Navigation

*For any* logged-in user, the navigation link to "My Jobs" must be visible if and only if the user's role is "employer".

**Validates: Requirements 8.1**

### Property 18: Route Protection

*For any* user without the "employer" role, attempting to access the /my-jobs or /job-applicants/:id routes must result in a redirect to the home page.

**Validates: Requirements 8.2**

### Property 19: State Persistence Across Navigation

*For any* employer, when navigating from the Job Management Dashboard to another page and back, the Redux state (jobs list, pagination) must be preserved.

**Validates: Requirements 8.4**

### Property 20: Responsive Layout Adaptation

*For any* viewport width, the job list layout must display as a single column when width < 768px and as a multi-column grid when width >= 768px.

**Validates: Requirements 9.2, 9.3**

### Property 21: Success Notification Display

*For any* successful API operation (create, update, delete job, update application status), a success toast notification must be displayed.

**Validates: Requirements 10.1**

### Property 22: Error Notification Display

*For any* failed API operation, an error toast notification must be displayed containing the error message from the API response.

**Validates: Requirements 10.2**

### Property 23: Form Submission Prevention

*For any* form being submitted, the submit button must be disabled during the submission to prevent duplicate requests.

**Validates: Requirements 10.4**

## Error Handling

### Client-Side Error Handling

1. **Form Validation Errors**
   - Display inline validation messages for invalid fields
   - Prevent form submission until all validations pass
   - Clear validation errors when user corrects input

2. **Network Errors**
   - Display user-friendly error messages via toast notifications
   - Maintain UI state on error (don't clear forms or remove data)
   - Provide retry mechanisms where appropriate

3. **Authorization Errors (403)**
   - Display specific message: "You do not have permission to perform this action"
   - Handled globally by axios interceptor in api.js
   - Don't modify UI state on authorization failures

4. **Authentication Errors (401)**
   - Handled globally by axios interceptor
   - Clear user from localStorage
   - Redirect to login page with notification
   - Implemented in existing api.js

5. **Not Found Errors (404)**
   - Display message: "Resource not found"
   - Redirect to appropriate page (e.g., back to job list if job not found)

6. **Server Errors (500)**
   - Display message: "Server error. Please try again later"
   - Log error details for debugging
   - Maintain UI state for user to retry

### Redux Error State Management

All async thunks follow this pattern:

```javascript
// Pending state
.addCase(asyncThunk.pending, (state) => {
  state.isLoading = true;
  state.isError = false;
  state.message = '';
})

// Success state
.addCase(asyncThunk.fulfilled, (state, action) => {
  state.isLoading = false;
  state.isSuccess = true;
  // Update relevant state
})

// Error state
.addCase(asyncThunk.rejected, (state, action) => {
  state.isLoading = false;
  state.isError = true;
  state.message = action.payload; // Error message from API
})
```

### Error Recovery Strategies

1. **Optimistic Updates**: Not used for this feature to ensure data consistency
2. **Retry Logic**: User-initiated retries via UI (no automatic retries)
3. **Graceful Degradation**: Show cached data when available, indicate stale state
4. **User Feedback**: Always inform user of errors with actionable messages

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs through randomization

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Testing

**Framework**: Vitest + React Testing Library

**Focus Areas**:
1. **Component Rendering**
   - Empty states (no jobs, no applications)
   - Loading states
   - Error states
   - Specific UI interactions (button clicks, form submissions)

2. **Edge Cases**
   - Empty form submission attempts
   - Invalid salary values (negative, non-numeric)
   - Authorization errors (403 responses)
   - Network timeouts

3. **Integration Points**
   - Redux store integration
   - React Router navigation
   - Toast notification triggers

**Example Unit Tests**:
```javascript
describe('MyJobs', () => {
  it('displays empty state when no jobs exist', () => {
    // Test empty state rendering
  });

  it('shows loading spinner during fetch', () => {
    // Test loading state
  });

  it('handles 403 authorization error', () => {
    // Test specific error case
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with reference to design document property
- Tag format: `Feature: employer-job-management, Property {number}: {property_text}`

**Focus Areas**:
1. **Data Transformations**
   - Job creation/update/delete operations
   - Application status updates
   - Redux state updates

2. **Invariants**
   - Job sorting order
   - Form validation rules
   - Conditional rendering logic

3. **Round-Trip Properties**
   - Create job → appears in list
   - Update job → changes reflected
   - Delete job → removed from list
   - Update status → status changed

**Example Property Tests**:
```javascript
import fc from 'fast-check';

// Feature: employer-job-management, Property 3: Job Sorting Invariant
test('jobs are always sorted by creation date descending', () => {
  fc.assert(
    fc.property(fc.array(jobArbitrary()), (jobs) => {
      const sorted = sortJobsByDate(jobs);
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(new Date(sorted[i].createdAt))
          .toBeGreaterThanOrEqual(new Date(sorted[i + 1].createdAt));
      }
    }),
    { numRuns: 100 }
  );
});

// Feature: employer-job-management, Property 5: Job Creation Round Trip
test('created job appears in employer job list', () => {
  fc.assert(
    fc.property(validJobDataArbitrary(), async (jobData) => {
      const initialJobs = await getEmployerJobs();
      await createJob(jobData);
      const updatedJobs = await getEmployerJobs();
      
      expect(updatedJobs.length).toBe(initialJobs.length + 1);
      expect(updatedJobs.some(job => 
        job.title === jobData.title && 
        job.company === jobData.company
      )).toBe(true);
    }),
    { numRuns: 100 }
  );
});
```

### Test Data Generators (Arbitraries)

For property-based testing, we need generators for:

1. **Valid Job Data**
   ```javascript
   const validJobDataArbitrary = () => fc.record({
     title: fc.string({ minLength: 1, maxLength: 100 }),
     company: fc.string({ minLength: 1, maxLength: 100 }),
     description: fc.string({ minLength: 10, maxLength: 1000 }),
     location: fc.string({ minLength: 1, maxLength: 100 }),
     salary: fc.integer({ min: 1, max: 1000000 })
   });
   ```

2. **Job Objects**
   ```javascript
   const jobArbitrary = () => fc.record({
     _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
     ...validJobDataArbitrary(),
     employer: fc.hexaString({ minLength: 24, maxLength: 24 }),
     createdAt: fc.date(),
     applicationCount: fc.integer({ min: 0, max: 100 })
   });
   ```

3. **Application Objects**
   ```javascript
   const applicationArbitrary = () => fc.record({
     _id: fc.hexaString({ minLength: 24, maxLength: 24 }),
     job: jobArbitrary(),
     jobseeker: userArbitrary(),
     status: fc.constantFrom('pending', 'accepted', 'rejected'),
     createdAt: fc.date()
   });
   ```

### Testing Coverage Goals

- **Unit Test Coverage**: 80%+ for components and Redux slices
- **Property Test Coverage**: All 23 correctness properties implemented
- **Integration Test Coverage**: Critical user flows (create job → view applicants → update status)
- **E2E Test Coverage**: Complete employer workflow (optional, future enhancement)

### Continuous Integration

- Run all tests on every pull request
- Fail build if any test fails
- Generate coverage reports
- Property tests run with 100 iterations in CI (can increase for release builds)


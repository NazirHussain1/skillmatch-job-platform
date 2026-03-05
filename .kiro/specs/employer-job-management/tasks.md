# Implementation Plan: Employer Job Management

## Overview

This implementation plan creates a comprehensive frontend interface for employers to manage job postings and review applications in the SkillMatch MERN platform. The implementation leverages existing backend API endpoints and follows established patterns for React components, Redux Toolkit state management, and Tailwind CSS styling.

The plan is structured to build incrementally: first establishing the foundation (Redux slices and services), then implementing core job management features, followed by application management, and finally polishing with responsive design and user feedback mechanisms.

## Tasks

- [ ] 1. Set up Redux state management and service layer
  - [ ] 1.1 Extend jobs Redux slice with employer-specific state
    - Add `employerJobs` array to store employer's posted jobs
    - Add async thunks: `getEmployerJobs`, `createJob`, `updateJob`, `deleteJob`
    - Implement reducers for all job CRUD operations
    - Handle loading, success, and error states
    - _Requirements: 7.1, 7.3, 7.6_
  
  - [ ]* 1.2 Write property test for jobs Redux slice
    - **Property 15: Redux State Synchronization**
    - **Validates: Requirements 7.1, 7.3**
  
  - [ ] 1.3 Extend applications Redux slice with job applications state
    - Add `jobApplications` array to store applications for a specific job
    - Add async thunks: `getJobApplications`, `updateApplicationStatus`
    - Implement reducers for application operations
    - Handle loading, success, and error states
    - _Requirements: 7.2, 7.4, 7.6_
  
  - [ ]* 1.4 Write property test for applications Redux slice
    - **Property 15: Redux State Synchronization**
    - **Validates: Requirements 7.2, 7.4**
  
  - [ ] 1.5 Create job service module (frontend/src/services/jobService.js)
    - Implement `getEmployerJobs()` - GET /api/jobs with employer filter
    - Implement `createJob(jobData)` - POST /api/jobs
    - Implement `updateJob(id, jobData)` - PUT /api/jobs/:id
    - Implement `deleteJob(id)` - DELETE /api/jobs/:id
    - Use centralized axios instance from api.js
    - _Requirements: 1.1, 2.3, 3.3, 4.3_
  
  - [ ] 1.6 Create application service module (frontend/src/services/applicationService.js)
    - Implement `getJobApplications(jobId)` - GET /api/applications/job/:jobId
    - Implement `updateApplicationStatus(id, status)` - PUT /api/applications/:id
    - Use centralized axios instance from api.js
    - _Requirements: 5.1, 6.2, 6.3_

- [ ] 2. Implement shared components
  - [ ] 2.1 Create JobForm component (frontend/src/components/JobForm.jsx)
    - Accept props: initialData, onSubmit, onCancel, isLoading
    - Implement form fields: title, company, description, location, salary
    - Add client-side validation for all required fields
    - Validate salary is positive number
    - Disable submit button when form is invalid or loading
    - Style with Tailwind CSS
    - _Requirements: 2.2, 2.6, 3.2_
  
  - [ ]* 2.2 Write unit tests for JobForm component
    - Test form validation for empty fields
    - Test salary validation (negative, non-numeric)
    - Test submit button disabled state
    - Test form submission with valid data
    - _Requirements: 2.2, 2.6_
  
  - [ ]* 2.3 Write property test for JobForm validation
    - **Property 4: Form Validation Completeness**
    - **Validates: Requirements 2.2, 2.6**
  
  - [ ] 2.4 Create ConfirmDialog component (frontend/src/components/ConfirmDialog.jsx)
    - Accept props: isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant
    - Implement modal overlay with backdrop
    - Style with Tailwind CSS (danger variant for delete operations)
    - Add Lucide React icons for visual feedback
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 2.5 Write unit tests for ConfirmDialog component
    - Test dialog opens and closes correctly
    - Test confirm and cancel callbacks
    - Test different variants (danger, warning, info)
    - _Requirements: 4.1, 4.6_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement MyJobs page - Core structure and job display
  - [ ] 4.1 Create MyJobs page component (frontend/src/pages/MyJobs.jsx)
    - Set up component structure with Redux hooks (useDispatch, useSelector)
    - Fetch employer jobs on component mount using getEmployerJobs thunk
    - Display loading spinner during fetch
    - Display error message if fetch fails
    - Implement empty state when no jobs exist with call-to-action
    - _Requirements: 1.1, 1.4_
  
  - [ ] 4.2 Implement job list display with cards
    - Create job card grid layout using Tailwind CSS
    - Display job details: title, company, location, salary, posting date
    - Add application count badge to each job card
    - Sort jobs by creation date (newest first)
    - Add Lucide React icons for actions (Edit, Trash2, Users)
    - _Requirements: 1.2, 1.3, 1.5_
  
  - [ ]* 4.3 Write property test for job display
    - **Property 2: Job Display Completeness**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 4.4 Write property test for job sorting
    - **Property 3: Job Sorting Invariant**
    - **Validates: Requirements 1.5**
  
  - [ ]* 4.5 Write unit tests for MyJobs page
    - Test empty state rendering
    - Test loading state rendering
    - Test error state rendering
    - Test job list rendering with mock data
    - _Requirements: 1.1, 1.4_

- [ ] 5. Implement MyJobs page - Create job functionality
  - [ ] 5.1 Add create job modal to MyJobs page
    - Add "Create Job" button in page header
    - Implement modal state management (open/close)
    - Render JobForm component inside modal
    - Handle form submission by dispatching createJob thunk
    - Display success toast notification on successful creation
    - Display error toast notification on failure
    - Close modal and refresh job list on success
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 10.1, 10.2_
  
  - [ ]* 5.2 Write property test for job creation
    - **Property 5: Job Creation Round Trip**
    - **Validates: Requirements 2.3, 2.4, 7.3**
  
  - [ ]* 5.3 Write unit tests for create job flow
    - Test modal opens when button clicked
    - Test modal closes on cancel
    - Test success notification displayed
    - Test error notification displayed
    - Test job list refreshes after creation
    - _Requirements: 2.1, 2.4, 2.5_

- [ ] 6. Implement MyJobs page - Edit job functionality
  - [ ] 6.1 Add edit job modal to MyJobs page
    - Add "Edit" button to each job card
    - Implement edit modal state management
    - Pre-fill JobForm with selected job data
    - Handle form submission by dispatching updateJob thunk
    - Display success toast notification on successful update
    - Display error toast notification on failure (including 403 authorization errors)
    - Close modal and update job in list on success
    - Allow user to cancel editing without changes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.1, 10.2_
  
  - [ ]* 6.2 Write property test for job update
    - **Property 6: Job Update Round Trip**
    - **Validates: Requirements 3.3, 3.4, 7.3**
  
  - [ ]* 6.3 Write property test for edit cancellation
    - **Property 9: Edit Cancellation Preserves State**
    - **Validates: Requirements 3.6**
  
  - [ ]* 6.4 Write unit tests for edit job flow
    - Test edit modal opens with pre-filled data
    - Test modal closes on cancel without changes
    - Test success notification displayed
    - Test error notification for 403 errors
    - Test job data updates in list
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

- [ ] 7. Implement MyJobs page - Delete job functionality
  - [ ] 7.1 Add delete job functionality to MyJobs page
    - Add "Delete" button to each job card
    - Implement delete confirmation dialog using ConfirmDialog component
    - Display warning about permanent deletion and application removal
    - Handle confirmation by dispatching deleteJob thunk
    - Display success toast notification on successful deletion
    - Display error toast notification on failure
    - Remove job from list on success
    - Keep job in list on error or cancellation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.1, 10.2_
  
  - [ ]* 7.2 Write property test for job deletion
    - **Property 7: Job Deletion Consistency**
    - **Validates: Requirements 4.3, 4.4, 7.3**
  
  - [ ]* 7.3 Write property test for deletion cancellation
    - **Property 8: Deletion Cancellation Preserves State**
    - **Validates: Requirements 4.6**
  
  - [ ]* 7.4 Write unit tests for delete job flow
    - Test confirmation dialog opens
    - Test dialog closes on cancel without deletion
    - Test success notification displayed
    - Test error notification displayed
    - Test job removed from list on success
    - _Requirements: 4.1, 4.4, 4.5, 4.6_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement JobApplicants page - Core structure and applicant display
  - [ ] 9.1 Create JobApplicants page component (frontend/src/pages/JobApplicants.jsx)
    - Set up component structure with Redux hooks and useParams for jobId
    - Fetch job applications on component mount using getJobApplications thunk
    - Display loading spinner during fetch
    - Display error message if fetch fails
    - Implement empty state when no applications exist
    - Add back button to return to MyJobs page
    - Display job title in page header
    - _Requirements: 5.1, 5.4_
  
  - [ ] 9.2 Implement applicant list display
    - Create applicant card list layout using Tailwind CSS
    - Display applicant details: name, email, resume link, status, submission date
    - Add status badge with color coding (pending: yellow, accepted: green, rejected: red)
    - Format submission date for readability
    - Make resume link clickable to open in new tab
    - _Requirements: 5.2, 5.3_
  
  - [ ]* 9.3 Write property test for applicant display
    - **Property 11: Applicant Display Completeness**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 9.4 Write unit tests for JobApplicants page
    - Test empty state rendering
    - Test loading state rendering
    - Test error state rendering
    - Test applicant list rendering with mock data
    - Test back button navigation
    - _Requirements: 5.1, 5.4_

- [ ] 10. Implement JobApplicants page - Status filtering and actions
  - [ ] 10.1 Add status filter to JobApplicants page
    - Implement filter tabs or dropdown for status (All, Pending, Accepted, Rejected)
    - Filter displayed applications based on selected status
    - Update URL query parameter when filter changes (optional)
    - _Requirements: 5.5_
  
  - [ ]* 10.2 Write property test for status filtering
    - **Property 12: Application Status Filtering**
    - **Validates: Requirements 5.5**
  
  - [ ] 10.3 Add accept/reject actions to JobApplicants page
    - Display Accept and Reject buttons for pending applications only
    - Hide action buttons for accepted or rejected applications
    - Handle Accept button click by dispatching updateApplicationStatus thunk with "accepted"
    - Handle Reject button click by dispatching updateApplicationStatus thunk with "rejected"
    - Display success toast notification on successful status update
    - Display error toast notification on failure (including 403 authorization errors)
    - Update application status in list and remove action buttons on success
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.1, 10.2_
  
  - [ ]* 10.4 Write property test for conditional action buttons
    - **Property 13: Conditional Action Buttons**
    - **Validates: Requirements 6.1, 6.6**
  
  - [ ]* 10.5 Write property test for application status update
    - **Property 14: Application Status Update Round Trip**
    - **Validates: Requirements 6.2, 6.3, 6.4, 7.4**
  
  - [ ]* 10.6 Write unit tests for status actions
    - Test action buttons only shown for pending applications
    - Test Accept button updates status to accepted
    - Test Reject button updates status to rejected
    - Test success notification displayed
    - Test error notification for 403 errors
    - Test action buttons removed after status update
    - _Requirements: 6.1, 6.4, 6.5, 6.6_

- [ ] 11. Implement navigation and route protection
  - [ ] 11.1 Add MyJobs route to React Router configuration
    - Add route path "/my-jobs" with MyJobs component
    - Wrap route with RoleBasedRoute component requiring "employer" role
    - Redirect non-employers to home page
    - _Requirements: 8.2, 8.3_
  
  - [ ] 11.2 Add JobApplicants route to React Router configuration
    - Add route path "/job-applicants/:jobId" with JobApplicants component
    - Wrap route with RoleBasedRoute component requiring "employer" role
    - Redirect non-employers to home page
    - _Requirements: 8.2, 8.3_
  
  - [ ] 11.3 Add navigation link to MyJobs in header/navbar
    - Add "My Jobs" navigation link visible only to employers
    - Use conditional rendering based on user role
    - Style consistently with existing navigation links
    - _Requirements: 8.1_
  
  - [ ]* 11.4 Write property test for role-based navigation
    - **Property 17: Role-Based Navigation**
    - **Validates: Requirements 8.1**
  
  - [ ]* 11.5 Write property test for route protection
    - **Property 18: Route Protection**
    - **Validates: Requirements 8.2**
  
  - [ ]* 11.6 Write unit tests for navigation and routing
    - Test "My Jobs" link only visible to employers
    - Test non-employers redirected from /my-jobs
    - Test non-employers redirected from /job-applicants/:jobId
    - Test employers can access both routes
    - _Requirements: 8.1, 8.2_

- [ ] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement responsive design and styling
  - [ ] 13.1 Make MyJobs page responsive
    - Implement single-column layout for mobile (width < 768px)
    - Implement multi-column grid layout for desktop (width >= 768px)
    - Ensure job cards stack properly on mobile
    - Test responsive behavior at breakpoints: 640px, 768px, 1024px, 1280px
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 13.2 Make JobApplicants page responsive
    - Implement single-column layout for mobile
    - Ensure applicant cards stack properly on mobile
    - Make status filter tabs/dropdown mobile-friendly
    - Test responsive behavior at all breakpoints
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ] 13.3 Ensure consistent styling across all components
    - Use consistent Tailwind CSS spacing utilities
    - Use consistent color scheme matching existing application
    - Use consistent typography (font sizes, weights)
    - Add Lucide React icons consistently (Edit, Trash2, Users, ArrowLeft, Check, X)
    - Ensure proper hover and focus states for interactive elements
    - _Requirements: 9.4, 9.5_
  
  - [ ]* 13.4 Write property test for responsive layout
    - **Property 20: Responsive Layout Adaptation**
    - **Validates: Requirements 9.2, 9.3**
  
  - [ ]* 13.5 Write visual regression tests (optional)
    - Test component rendering at different viewport sizes
    - Test dark mode compatibility (if applicable)
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 14. Implement user feedback and notifications
  - [ ] 14.1 Add toast notifications for all operations
    - Import and configure React Hot Toast
    - Add success toast for job creation with message "Job created successfully"
    - Add success toast for job update with message "Job updated successfully"
    - Add success toast for job deletion with message "Job deleted successfully"
    - Add success toast for application status update with message "Application status updated"
    - Add error toast for all failed operations with API error message
    - Configure toast auto-dismiss after 3 seconds
    - _Requirements: 10.1, 10.2, 10.5_
  
  - [ ]* 14.2 Write property test for success notifications
    - **Property 21: Success Notification Display**
    - **Validates: Requirements 10.1**
  
  - [ ]* 14.3 Write property test for error notifications
    - **Property 22: Error Notification Display**
    - **Validates: Requirements 10.2**
  
  - [ ] 14.4 Add loading indicators for async operations
    - Display loading spinner in MyJobs page during job fetch
    - Display loading spinner in JobApplicants page during applications fetch
    - Show loading state in submit buttons during form submission
    - Disable buttons during loading to prevent duplicate submissions
    - _Requirements: 10.3, 10.4_
  
  - [ ]* 14.5 Write property test for form submission prevention
    - **Property 23: Form Submission Prevention**
    - **Validates: Requirements 10.4**
  
  - [ ]* 14.6 Write unit tests for loading states
    - Test loading spinner displayed during operations
    - Test buttons disabled during submission
    - Test loading state cleared after operation completes
    - _Requirements: 10.3, 10.4_

- [ ] 15. Implement error handling and edge cases
  - [ ] 15.1 Add comprehensive error handling to Redux thunks
    - Handle network errors with user-friendly messages
    - Handle 401 errors (authentication) - rely on global axios interceptor
    - Handle 403 errors (authorization) with specific message
    - Handle 404 errors (not found) with specific message
    - Handle 500 errors (server error) with generic message
    - Preserve UI state on errors (don't clear forms or remove data)
    - _Requirements: 2.5, 3.5, 4.5, 6.5_
  
  - [ ]* 15.2 Write property test for error handling
    - **Property 10: Error Handling Preserves State**
    - **Validates: Requirements 2.5, 4.5**
  
  - [ ]* 15.3 Write unit tests for error scenarios
    - Test 403 authorization error handling
    - Test 404 not found error handling
    - Test 500 server error handling
    - Test network timeout error handling
    - Test UI state preserved on errors
    - _Requirements: 2.5, 3.5, 4.5, 6.5_

- [ ] 16. Final integration and testing
  - [ ] 16.1 Test complete employer workflow end-to-end
    - Manually test: Login as employer → View My Jobs → Create Job → Edit Job → Delete Job
    - Manually test: View Applicants → Filter by Status → Accept Application → Reject Application
    - Verify all Redux state updates correctly
    - Verify all toast notifications display correctly
    - Verify navigation works correctly
    - _Requirements: All_
  
  - [ ]* 16.2 Write integration tests for critical flows
    - Test complete job creation flow (open modal → fill form → submit → see in list)
    - Test complete job update flow (click edit → modify → submit → see changes)
    - Test complete job deletion flow (click delete → confirm → removed from list)
    - Test complete application status update flow (view applicants → accept → status updated)
    - _Requirements: All_
  
  - [ ]* 16.3 Write property test for state persistence
    - **Property 19: State Persistence Across Navigation**
    - **Validates: Requirements 8.4**

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation builds incrementally: foundation → core features → polish
- All components use Tailwind CSS for styling and Lucide React for icons
- All API calls go through Redux Toolkit async thunks for consistent state management
- React Hot Toast is used for all user notifications
- RoleBasedRoute component (existing) is used for route protection

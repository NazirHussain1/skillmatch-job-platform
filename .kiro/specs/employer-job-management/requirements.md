# Requirements Document

## Introduction

The Employer Job Management feature provides a comprehensive interface for employers to manage their job postings and review applications within the SkillMatch MERN job platform. This feature leverages existing backend API endpoints to deliver a complete job lifecycle management experience, including creating, viewing, editing, and deleting job postings, as well as reviewing applicants and updating application statuses.

## Glossary

- **Employer**: A user with employer role who can post and manage job listings
- **Job_Posting**: A job listing created by an employer containing title, company, description, location, and salary information
- **Application**: A jobseeker's submission to a specific job posting
- **Application_Status**: The current state of an application (pending, accepted, or rejected)
- **Job_Management_Dashboard**: The employer-specific interface for viewing and managing their posted jobs
- **Applicant_List**: A collection of applications submitted for a specific job posting
- **Frontend_UI**: The React-based user interface components
- **Backend_API**: The existing Express.js REST API endpoints
- **State_Management**: Redux Toolkit store managing application state

## Requirements

### Requirement 1: View Posted Jobs

**User Story:** As an employer, I want to view a list of all my posted jobs, so that I can see what positions I currently have open.

#### Acceptance Criteria

1. WHEN an employer navigates to the Job Management Dashboard, THE Frontend_UI SHALL fetch and display all jobs posted by that employer
2. THE Frontend_UI SHALL display each Job_Posting with its title, company, location, salary, and posting date
3. THE Frontend_UI SHALL display the number of applications received for each Job_Posting
4. WHEN no jobs exist for the employer, THE Frontend_UI SHALL display an empty state message with a call-to-action to create a job
5. THE Frontend_UI SHALL sort Job_Postings by creation date with newest first

### Requirement 2: Create Job Postings

**User Story:** As an employer, I want to create new job postings, so that I can advertise open positions to jobseekers.

#### Acceptance Criteria

1. WHEN an employer clicks the create job button, THE Frontend_UI SHALL display a job creation form
2. THE Frontend_UI SHALL require the employer to provide title, company, description, location, and salary fields
3. WHEN the employer submits a valid job form, THE Frontend_UI SHALL send a POST request to the Backend_API at /api/jobs
4. WHEN the Backend_API returns success, THE Frontend_UI SHALL display a success notification and refresh the job list
5. IF the Backend_API returns an error, THEN THE Frontend_UI SHALL display an error notification with the error message
6. THE Frontend_UI SHALL validate that all required fields are filled before enabling form submission

### Requirement 3: Edit Job Postings

**User Story:** As an employer, I want to edit my existing job postings, so that I can update job details when requirements change.

#### Acceptance Criteria

1. WHEN an employer clicks the edit button on a Job_Posting, THE Frontend_UI SHALL display a pre-filled edit form with current job data
2. THE Frontend_UI SHALL allow the employer to modify title, company, description, location, and salary fields
3. WHEN the employer submits the updated form, THE Frontend_UI SHALL send a PUT request to the Backend_API at /api/jobs/:id
4. WHEN the Backend_API returns success, THE Frontend_UI SHALL display a success notification and update the job in the list
5. IF the Backend_API returns an authorization error, THEN THE Frontend_UI SHALL display an error notification indicating insufficient permissions
6. THE Frontend_UI SHALL allow the employer to cancel editing and revert to the original values

### Requirement 4: Delete Job Postings

**User Story:** As an employer, I want to delete job postings, so that I can remove positions that are no longer available.

#### Acceptance Criteria

1. WHEN an employer clicks the delete button on a Job_Posting, THE Frontend_UI SHALL display a confirmation dialog
2. THE Frontend_UI SHALL warn the employer that deletion is permanent and will remove all associated applications
3. WHEN the employer confirms deletion, THE Frontend_UI SHALL send a DELETE request to the Backend_API at /api/jobs/:id
4. WHEN the Backend_API returns success, THE Frontend_UI SHALL display a success notification and remove the job from the list
5. IF the Backend_API returns an error, THEN THE Frontend_UI SHALL display an error notification and keep the job in the list
6. WHEN the employer cancels the confirmation dialog, THE Frontend_UI SHALL not delete the Job_Posting

### Requirement 5: View Job Applicants

**User Story:** As an employer, I want to view all applicants for each of my job postings, so that I can review candidates.

#### Acceptance Criteria

1. WHEN an employer clicks to view applicants for a Job_Posting, THE Frontend_UI SHALL send a GET request to the Backend_API at /api/applications/job/:jobId
2. THE Frontend_UI SHALL display the Applicant_List with each applicant's name, email, resume link, and Application_Status
3. THE Frontend_UI SHALL display the application submission date for each applicant
4. WHEN no applications exist for a Job_Posting, THE Frontend_UI SHALL display a message indicating no applicants have applied yet
5. THE Frontend_UI SHALL group or filter applications by Application_Status (pending, accepted, rejected)

### Requirement 6: Update Application Status

**User Story:** As an employer, I want to accept or reject applications, so that I can manage my hiring pipeline.

#### Acceptance Criteria

1. WHEN an employer views an Application with pending status, THE Frontend_UI SHALL display accept and reject action buttons
2. WHEN the employer clicks accept, THE Frontend_UI SHALL send a PUT request to the Backend_API at /api/applications/:id with status "accepted"
3. WHEN the employer clicks reject, THE Frontend_UI SHALL send a PUT request to the Backend_API at /api/applications/:id with status "rejected"
4. WHEN the Backend_API returns success, THE Frontend_UI SHALL update the Application_Status in the interface and display a success notification
5. IF the Backend_API returns an authorization error, THEN THE Frontend_UI SHALL display an error notification indicating insufficient permissions
6. WHEN an Application has status accepted or rejected, THE Frontend_UI SHALL display the status without action buttons

### Requirement 7: State Management Integration

**User Story:** As a developer, I want centralized state management for job and application data, so that the UI remains consistent and performant.

#### Acceptance Criteria

1. THE State_Management SHALL store the employer's posted jobs in a Redux slice
2. THE State_Management SHALL store application data for each job in a Redux slice
3. WHEN a job is created, updated, or deleted, THE State_Management SHALL update the Redux store accordingly
4. WHEN an application status is updated, THE State_Management SHALL update the Redux store accordingly
5. THE Frontend_UI SHALL subscribe to Redux state changes and re-render when job or application data changes
6. THE State_Management SHALL handle loading and error states for all API operations

### Requirement 8: Navigation and Access Control

**User Story:** As an employer, I want easy access to my job management dashboard, so that I can quickly manage my postings.

#### Acceptance Criteria

1. WHEN an employer is logged in, THE Frontend_UI SHALL display a navigation link to the Job Management Dashboard
2. WHEN a user without employer role attempts to access the Job Management Dashboard, THE Frontend_UI SHALL redirect them to the home page
3. THE Frontend_UI SHALL display the Job Management Dashboard as a separate route from the public job browsing page
4. WHEN an employer navigates between the Job Management Dashboard and other pages, THE Frontend_UI SHALL preserve the application state

### Requirement 9: Responsive Design and Styling

**User Story:** As an employer, I want the job management interface to work on all devices, so that I can manage jobs from desktop or mobile.

#### Acceptance Criteria

1. THE Frontend_UI SHALL use Tailwind CSS classes to create a responsive layout
2. WHEN viewed on mobile devices, THE Frontend_UI SHALL display jobs in a single column with stacked information
3. WHEN viewed on desktop devices, THE Frontend_UI SHALL display jobs in a grid or table layout with multiple columns
4. THE Frontend_UI SHALL use Lucide React icons for all action buttons (edit, delete, view applicants)
5. THE Frontend_UI SHALL maintain consistent spacing, colors, and typography with the existing application design

### Requirement 10: User Feedback and Notifications

**User Story:** As an employer, I want clear feedback on my actions, so that I know when operations succeed or fail.

#### Acceptance Criteria

1. WHEN any API operation completes successfully, THE Frontend_UI SHALL display a success notification using React Hot Toast
2. WHEN any API operation fails, THE Frontend_UI SHALL display an error notification using React Hot Toast with the error message
3. THE Frontend_UI SHALL display loading indicators during API operations
4. WHEN a form is being submitted, THE Frontend_UI SHALL disable the submit button to prevent duplicate submissions
5. THE Frontend_UI SHALL clear notifications automatically after 3 seconds

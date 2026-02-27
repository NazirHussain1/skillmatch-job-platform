# Entity Relationship Diagram

## Database Schema Overview

This document describes the database schema for the SkillMatch AI platform.

## Entities

### User
Represents all users in the system (job seekers, employers, and admins).

```
┌─────────────────────────────────────────┐
│              USER                       │
├─────────────────────────────────────────┤
│ _id: ObjectId (PK)                      │
│ name: String                            │
│ email: String (unique, indexed)         │
│ password: String (hashed)               │
│ role: Enum (job_seeker, employer, admin)│
│ avatar: String (URL)                    │
│ bio: String                             │
│ skills: [String]                        │
│ experienceLevel: Enum (entry,mid,senior)│
│ companyName: String                     │
│ companyLogo: String (URL)               │
│ resume: String (URL)                    │
│ refreshTokens: [String]                 │
│ createdAt: Date                         │
│ updatedAt: Date                         │
└─────────────────────────────────────────┘
```

**Indexes:**
- `email` (unique)
- `role`
- `skills` (text index for search)

---

### Job
Represents job postings created by employers.

```
┌─────────────────────────────────────────┐
│              JOB                        │
├─────────────────────────────────────────┤
│ _id: ObjectId (PK)                      │
│ title: String (text indexed)            │
│ employerId: ObjectId (FK → User)        │
│ companyName: String (text indexed)      │
│ location: String                        │
│ salary: String                          │
│ salaryRange: Number                     │
│ type: Enum (Full-time, Part-time, etc.) │
│ experienceLevel: Enum (entry,mid,senior)│
│ description: String (text indexed)      │
│ requiredSkills: [String] (text indexed) │
│ isActive: Boolean                       │
│ views: Number                           │
│ uniqueViewers: [ObjectId]               │
│ applicationCount: Number                │
│ postedAt: Date                          │
│ deletedAt: Date (soft delete)           │
│ createdAt: Date                         │
│ updatedAt: Date                         │
│ __v: Number (version key)               │
└─────────────────────────────────────────┘
```

**Indexes:**
- `employerId`
- `isActive`
- `postedAt` (descending)
- Text index: `{ title: 10, requiredSkills: 5, companyName: 3, description: 1 }`
- Compound: `{ isActive: 1, postedAt: -1 }`

---

### Application
Represents job applications submitted by job seekers.

```
┌─────────────────────────────────────────┐
│           APPLICATION                   │
├─────────────────────────────────────────┤
│ _id: ObjectId (PK)                      │
│ jobId: ObjectId (FK → Job)              │
│ userId: ObjectId (FK → User)            │
│ jobTitle: String                        │
│ companyName: String                     │
│ status: Enum (Pending, Reviewing, etc.) │
│ matchScore: Number                      │
│ appliedAt: Date                         │
│ deletedAt: Date (soft delete)           │
│ createdAt: Date                         │
│ updatedAt: Date                         │
│ __v: Number (version key)               │
└─────────────────────────────────────────┘
```

**Indexes:**
- `jobId`
- `userId`
- `status`
- Compound: `{ userId: 1, jobId: 1 }` (unique, for preventing duplicate applications)
- Compound: `{ jobId: 1, status: 1 }`

---

### Notification
Represents real-time notifications sent to users.

```
┌─────────────────────────────────────────┐
│          NOTIFICATION                   │
├─────────────────────────────────────────┤
│ _id: ObjectId (PK)                      │
│ userId: ObjectId (FK → User)            │
│ type: Enum (application_submitted, etc.)│
│ title: String                           │
│ message: String                         │
│ isRead: Boolean                         │
│ relatedEntityId: ObjectId               │
│ relatedEntityType: String               │
│ deletedAt: Date (soft delete)           │
│ createdAt: Date                         │
│ updatedAt: Date                         │
│ __v: Number (version key)               │
└─────────────────────────────────────────┘
```

**Indexes:**
- `userId`
- `isRead`
- Compound: `{ userId: 1, isRead: 1, createdAt: -1 }`

---

### SearchHistory
Stores user search history for analytics and quick access.

```
┌─────────────────────────────────────────┐
│         SEARCH_HISTORY                  │
├─────────────────────────────────────────┤
│ _id: ObjectId (PK)                      │
│ userId: ObjectId (FK → User)            │
│ query: String                           │
│ filters: Object                         │
│ resultCount: Number                     │
│ searchedAt: Date                        │
└─────────────────────────────────────────┘
```

**Indexes:**
- `userId`
- `searchedAt` (descending)

---

## Relationships

### One-to-Many Relationships

1. **User → Job**
   - One employer can create many jobs
   - `Job.employerId` references `User._id`

2. **User → Application**
   - One job seeker can submit many applications
   - `Application.userId` references `User._id`

3. **Job → Application**
   - One job can receive many applications
   - `Application.jobId` references `Job._id`

4. **User → Notification**
   - One user can receive many notifications
   - `Notification.userId` references `User._id`

5. **User → SearchHistory**
   - One user can have many search history entries
   - `SearchHistory.userId` references `User._id`

---

## Visual Diagram

```
┌──────────┐
│   USER   │
└────┬─────┘
     │
     │ 1:N (employer creates jobs)
     ├─────────────────────────────────┐
     │                                 │
     ▼                                 ▼
┌─────────┐                    ┌──────────────┐
│   JOB   │◄───────────────────┤ APPLICATION  │
└─────────┘        N:1         └──────────────┘
                  (job has                ▲
                applications)              │
                                          │ N:1
                                          │ (user applies)
                                          │
                                    ┌─────┴────┐
                                    │   USER   │
                                    └──────────┘
                                          │
                                          │ 1:N
                                          ├──────────────────┐
                                          │                  │
                                          ▼                  ▼
                                  ┌──────────────┐  ┌──────────────┐
                                  │ NOTIFICATION │  │SEARCH_HISTORY│
                                  └──────────────┘  └──────────────┘
```

---

## Key Features

### Soft Delete
- `Job`, `Application`, and `Notification` models support soft delete
- Uses `deletedAt` field (null = active, date = deleted)
- Queries automatically filter out soft-deleted records

### Optimistic Concurrency Control
- `Application`, `Notification`, and `Job` models use version keys (`__v`)
- Prevents race conditions during concurrent updates
- MongoDB automatically increments version on each update

### Text Search
- Full-text search on `Job` model with weighted fields:
  - `title`: weight 10
  - `requiredSkills`: weight 5
  - `companyName`: weight 3
  - `description`: weight 1

### Denormalization
- `Application` stores `jobTitle` and `companyName` for performance
- Reduces need for joins when displaying application lists
- Trade-off: slight data redundancy for better read performance

---

## Data Integrity

### Transactions
MongoDB transactions are used for:
- Creating applications (Application + Notification creation)
- Status updates (Application update + Notification creation)

### Validation
- Schema-level validation in Mongoose models
- Application-level validation using express-validator
- Status transition validation (e.g., can't go from Accepted to Pending)

### Referential Integrity
- Foreign key relationships enforced at application level
- Cascade delete handled by application logic
- Orphaned records prevented through validation

---

## Scalability Considerations

### Indexes
- Strategic indexes on frequently queried fields
- Compound indexes for common query patterns
- Text indexes for search functionality

### Caching
- Redis caching for:
  - Search results (5-minute TTL)
  - User sessions
  - Rate limiting counters
  - Token blacklist

### Sharding Strategy (Future)
- Shard key candidates:
  - `User`: by `_id` or `email` hash
  - `Job`: by `employerId` or geographic region
  - `Application`: by `userId` or `jobId`

---

## Security

### Password Storage
- Bcrypt hashing with salt rounds
- Never stored in plain text

### Token Management
- JWT access tokens (15-minute expiry)
- Refresh tokens (7-day expiry, httpOnly cookies)
- Token blacklist in Redis for logout

### Data Sanitization
- MongoDB injection prevention (mongo-sanitize)
- XSS protection (xss-clean)
- Input validation on all endpoints

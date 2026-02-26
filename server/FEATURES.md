# Advanced Platform Features

## Overview
This document describes the advanced features implemented in the SkillMatch AI platform.

## Features Implemented

### 1. Real-Time Notifications (Socket.IO)

**Endpoints:**
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

**Socket.IO Events:**
- `notification` - Real-time notification delivery
- Automatic authentication using JWT
- Room-based broadcasting (user-specific and role-specific)

**Features:**
- Real-time application status updates
- Live employer dashboard updates
- Notification types: application_submitted, application_reviewed, application_accepted, application_rejected
- 90-day notification retention

### 2. File Upload System

**Endpoints:**
- `POST /api/uploads/resume` - Upload resume (PDF only, max 5MB)
- `POST /api/uploads/logo` - Upload company logo (images only, max 2MB)
- `DELETE /api/uploads/resume` - Delete resume
- `DELETE /api/uploads/logo` - Delete logo

**Features:**
- Cloudinary integration for file storage
- File validation (type, size, dimensions)
- Virus scanning simulation
- Automatic old file deletion
- Image optimization for logos
- Secure file URLs

**Supported Formats:**
- Resume: PDF only
- Logo: JPEG, PNG, WebP

### 3. Enhanced Search System

**Endpoints:**
- `GET /api/search/jobs` - Advanced job search
- `GET /api/search/history` - Get search history
- `DELETE /api/search/history` - Clear all search history
- `DELETE /api/search/history/:id` - Delete specific search

**Features:**
- Full-text search across title, description, skills
- Advanced filtering:
  - Location
  - Job type
  - Skills
  - Salary range
  - Experience level
- Sorting options:
  - Relevance (text score)
  - Date posted
  - Salary
- Pagination with metadata
- Search history storage (last 10 searches)
- Result count tracking

### 4. Analytics System

**Endpoints:**
- `GET /api/analytics/employer` - Employer analytics dashboard
- `GET /api/analytics/admin` - Admin analytics dashboard
- `POST /api/analytics/jobs/:jobId/view` - Track job view

**Employer Analytics:**
- Views per job
- Application conversion rate
- Skill demand statistics
- Application trends (30 days)
- Job performance metrics

**Admin Analytics:**
- Total users, jobs, applications
- Registration trends (30 days)
- Application activity (30 days)
- Most active employers
- Most popular jobs
- Platform-wide skill demand

**Features:**
- Unique view tracking per user
- Conversion rate calculation
- Daily trend aggregation
- Top 20 skill demand analysis

### 5. AI Matching System

**Endpoints:**
- `GET /api/matching/skill-gap/:jobId` - Get skill gap analysis
- `GET /api/matching/recommendations/jobs` - Get job recommendations
- `GET /api/matching/recommendations/candidates/:jobId` - Get candidate recommendations

**Features:**

**Weight-Based Skill Matching:**
- Exact match: 2.0x weight
- Category match: 1.5x weight
- Related match: 1.0x weight
- Normalized 0-100 score

**Experience Level Matching:**
- Exact match: 1.0x multiplier
- One level difference: 0.8x multiplier
- Two+ levels difference: 0.5x multiplier
- Levels: entry (0-2 years), mid (3-5 years), senior (6+ years)

**Skill Gap Analysis:**
- Matched skills list
- Missing skills list
- Match percentage
- Overall match score
- Experience level compatibility

**Job Recommendations:**
- Personalized for job seekers
- Minimum 60% match score
- Excludes already applied jobs
- Top 10 recommendations
- Sorted by match score

**Candidate Recommendations:**
- For employers per job posting
- Minimum 70% match score
- Excludes applicants
- Top 20 candidates
- Includes match details

## Database Schema Updates

### User Model
```javascript
{
  resumeUrl: String,
  resumePublicId: String,
  companyLogo: String,
  logoPublicId: String,
  experienceLevel: String (enum: entry, mid, senior)
}
```

### Job Model
```javascript
{
  salaryRange: Number,
  experienceLevel: String (enum: entry, mid, senior),
  views: Number,
  uniqueViewers: [ObjectId]
}
```

### New Models
- **Notification**: Stores user notifications
- **SearchHistory**: Stores user search queries

## Configuration

### Environment Variables
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for Socket.IO CORS)
FRONTEND_URL=http://localhost:5173
```

### Cloudinary Setup
1. Sign up at https://cloudinary.com
2. Get your credentials from dashboard
3. Add to .env file

## Socket.IO Client Integration

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

## API Usage Examples

### Upload Resume
```bash
curl -X POST http://localhost:5000/api/uploads/resume \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

### Search Jobs
```bash
curl "http://localhost:5000/api/search/jobs?search=developer&location=remote&experienceLevel=mid&page=1&limit=20"
```

### Get Job Recommendations
```bash
curl http://localhost:5000/api/matching/recommendations/jobs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Skill Gap
```bash
curl http://localhost:5000/api/matching/skill-gap/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Employer Analytics
```bash
curl http://localhost:5000/api/analytics/employer \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Performance Considerations

- Search limited to 1000 results before pagination
- Matching algorithms process max 100 jobs/candidates
- Analytics use MongoDB aggregation pipelines
- Caching recommended for production (Redis)
- Text indexes required for full-text search

## Security Features

- JWT authentication for Socket.IO
- File type validation
- File size limits
- Virus scanning simulation
- Rate limiting on uploads (10 files/hour)
- Filename sanitization
- Secure file URLs from Cloudinary

## Next Steps

1. Configure MongoDB Atlas connection
2. Set up Cloudinary account
3. Update .env with credentials
4. Test Socket.IO connections
5. Implement frontend integration
6. Add Redis caching for production
7. Implement real virus scanning service
8. Add email notifications
9. Implement rate limiting
10. Add monitoring and logging

## Testing

Start the server:
```bash
cd server
npm run dev
```

Server will run on http://localhost:5000 with Socket.IO enabled.

## Architecture

All features follow clean architecture:
- **Controllers**: Handle HTTP requests
- **Services**: Business logic
- **Repositories**: Database operations
- **Models**: MongoDB schemas
- **DTOs**: Data transfer objects
- **Middlewares**: Request processing
- **Utils**: Helper functions

## Support

For issues or questions, refer to the main README.md or ARCHITECTURE.md files.

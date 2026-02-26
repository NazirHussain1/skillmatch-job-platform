# Design Document: Advanced Platform Features

## Overview

This design document specifies the technical architecture for implementing advanced features in the SkillMatch AI hiring platform. The features include:

1. **Real-Time Notifications** - Socket.IO-based WebSocket system for instant updates
2. **File Upload System** - Secure file handling with Cloudinary integration for resumes and company logos
3. **Enhanced Search** - Full-text search with MongoDB text indexes and advanced filtering
4. **Analytics System** - Aggregation pipelines for platform metrics and insights
5. **AI Matching Algorithm** - Improved skill matching with weighted scoring and recommendations

The design follows the existing clean architecture pattern with clear separation of concerns across modules, services, repositories, and controllers. Each feature is implemented as a self-contained module that integrates seamlessly with the existing codebase.

### Design Goals

- Maintain consistency with existing clean architecture patterns
- Ensure scalability for real-time operations and large datasets
- Implement security best practices for file uploads and WebSocket connections
- Optimize performance through caching, indexing, and aggregation
- Provide extensibility for future enhancements

### Technology Stack

- **Real-Time**: Socket.IO 4.x with JWT authentication
- **File Storage**: Cloudinary with multer for upload handling
- **Database**: MongoDB with text indexes and aggregation pipelines
- **Caching**: In-memory caching with TTL for analytics and search results
- **Authentication**: JWT tokens (existing system)

## Architecture

### High-Level Architecture

The system extends the existing three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  (React Frontend with Socket.IO Client & File Upload UI)    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                          │
│         (Express.js with HTTP & WebSocket Support)           │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   HTTP API   │   │  Socket.IO   │   │ File Upload  │
│   Modules    │   │   Server     │   │   Handler    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Notification│ │  File   │ │  Search  │ │Analytics │      │
│  │  Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐                                               │
│  │ Matching │                                               │
│  │ Service  │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Repository  │   │   MongoDB    │   │  Cloudinary  │
│    Layer     │   │   Database   │   │     CDN      │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Module Structure

Each new feature follows the existing module pattern:

```
server/src/modules/{feature}/
├── {feature}.model.js       # Mongoose schema and model
├── {feature}.repository.js  # Data access layer
├── {feature}.service.js     # Business logic layer
├── {feature}.controller.js  # HTTP request handlers
├── {feature}.routes.js      # Route definitions
└── {feature}.dto.js         # Data transfer objects
```

New modules to be created:
- `notifications/` - Real-time notification management
- `file-uploads/` - File upload handling and validation
- `search/` - Enhanced search functionality
- `analytics/` - Analytics computation and caching
- `matching/` - AI-powered skill matching

### Shared Infrastructure

New shared components:
- `config/socket.config.js` - Socket.IO server configuration
- `config/cloudinary.config.js` - Cloudinary SDK configuration
- `middlewares/upload.middleware.js` - Multer file upload middleware
- `middlewares/socket-auth.middleware.js` - WebSocket authentication
- `utils/cache.util.js` - In-memory caching utility
- `utils/aggregation.util.js` - MongoDB aggregation helpers

## Components and Interfaces

### 1. Real-Time Notification System

#### Socket.IO Server Configuration

**File**: `server/src/config/socket.config.js`

```javascript
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './env.config.js';

export const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  return io;
};
```

#### Notification Model

**File**: `server/src/modules/notifications/notification.model.js`

```javascript
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'application_submitted',
      'application_reviewed',
      'application_accepted',
      'application_rejected',
      'new_message',
      'job_recommendation'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  relatedEntityType: {
    type: String,
    enum: ['Job', 'Application', 'Message'],
    required: false
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // 90 days in seconds
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Notification', notificationSchema);
```

#### Notification Service

**File**: `server/src/modules/notifications/notification.service.js`

```javascript
import notificationRepository from './notification.repository.js';
import { NotificationResponseDTO, CreateNotificationDTO } from './notification.dto.js';

class NotificationService {
  constructor() {
    this.io = null;
  }

  setSocketServer(io) {
    this.io = io;
  }

  async createAndEmit(data) {
    // Create notification in database
    const notificationData = new CreateNotificationDTO(data);
    const notification = await notificationRepository.create(notificationData);

    // Emit to connected user via Socket.IO
    if (this.io) {
      this.io.to(`user:${data.userId}`).emit('notification', 
        new NotificationResponseDTO(notification)
      );
    }

    return new NotificationResponseDTO(notification);
  }

  async getUserNotifications(userId, filters = {}) {
    const { type, isRead, page = 1, limit = 20 } = filters;
    
    const query = { userId };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead;

    const skip = (page - 1) * limit;
    const notifications = await notificationRepository.findAll(query, {
      sort: { createdAt: -1 },
      limit,
      skip
    });

    const total = await notificationRepository.count(query);

    return {
      notifications: notifications.map(n => new NotificationResponseDTO(n)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }

    const updated = await notificationRepository.update(notificationId, {
      isRead: true
    });

    return new NotificationResponseDTO(updated);
  }

  async markAllAsRead(userId) {
    await notificationRepository.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId, type = null) {
    const query = { userId, isRead: false };
    if (type) query.type = type;
    
    return await notificationRepository.count(query);
  }
}

export default new NotificationService();
```

#### Socket Event Handlers

**File**: `server/src/modules/notifications/socket.handlers.js`

```javascript
import notificationService from './notification.service.js';
import logger from '../../config/logger.config.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    logger.info(`User connected: ${userId} (${userRole})`);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Join role-specific room
    if (userRole === 'employer') {
      socket.join(`employers`);
    } else if (userRole === 'jobseeker') {
      socket.join(`jobseekers`);
    }

    // Handle notification acknowledgment
    socket.on('notification:read', async (notificationId) => {
      try {
        await notificationService.markAsRead(notificationId, userId);
        socket.emit('notification:read:success', { notificationId });
      } catch (error) {
        socket.emit('notification:read:error', { 
          error: error.message 
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
    });

    // Handle reconnection
    socket.on('reconnect', (attemptNumber) => {
      logger.info(`User reconnected: ${userId} after ${attemptNumber} attempts`);
    });
  });
};
```

### 2. File Upload System

#### Cloudinary Configuration

**File**: `server/src/config/cloudinary.config.js`

```javascript
import { v2 as cloudinary } from 'cloudinary';
import { 
  CLOUDINARY_CLOUD_NAME, 
  CLOUDINARY_API_KEY, 
  CLOUDINARY_API_SECRET 
} from './env.config.js';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary;
```

#### Upload Middleware

**File**: `server/src/middlewares/upload.middleware.js`

```javascript
import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

// Memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage();

// File filter for resumes (PDF only)
const resumeFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only PDF files are allowed for resumes'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only PNG, JPG, JPEG, and WebP images are allowed'), false);
  }
};

// Resume upload configuration
export const uploadResume = multer({
  storage,
  fileFilter: resumeFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('resume');

// Company logo upload configuration
export const uploadLogo = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}).single('logo');
```

#### File Upload Service

**File**: `server/src/modules/file-uploads/file-upload.service.js`

```javascript
import cloudinary from '../../config/cloudinary.config.js';
import ApiError from '../../utils/ApiError.js';
import logger from '../../config/logger.config.js';
import sharp from 'sharp';

class FileUploadService {
  constructor() {
    this.uploadAttempts = new Map(); // Rate limiting tracker
  }

  // Sanitize filename
  sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  // Simulate virus scanning
  async scanFile(buffer) {
    // Placeholder for virus scanning integration
    // In production, integrate with ClamAV or similar service
    logger.info('File scan simulation: PASSED');
    return true;
  }

  // Check rate limit
  checkRateLimit(userId) {
    const now = Date.now();
    const userAttempts = this.uploadAttempts.get(userId) || [];
    
    // Filter attempts within last hour
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < 3600000
    );

    if (recentAttempts.length >= 10) {
      throw ApiError.tooManyRequests('Upload limit exceeded. Try again later.');
    }

    recentAttempts.push(now);
    this.uploadAttempts.set(userId, recentAttempts);
  }

  // Upload resume to Cloudinary
  async uploadResume(file, userId) {
    this.checkRateLimit(userId);

    // Validate MIME type matches extension
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      throw ApiError.badRequest('File extension does not match PDF format');
    }

    // Scan file for security
    await this.scanFile(file.buffer);

    // Generate unique filename
    const sanitizedName = this.sanitizeFilename(
      file.originalname.replace('.pdf', '')
    );
    const uniqueName = `resume_${userId}_${Date.now()}_${sanitizedName}`;

    try {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'resumes',
            public_id: uniqueName,
            resource_type: 'raw',
            format: 'pdf'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      logger.info(`Resume uploaded successfully: ${result.secure_url}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      logger.error(`Resume upload failed: ${error.message}`);
      throw ApiError.internal('Failed to upload resume');
    }
  }

  // Upload company logo to Cloudinary
  async uploadLogo(file, userId) {
    this.checkRateLimit(userId);

    // Validate image dimensions
    const metadata = await sharp(file.buffer).metadata();
    
    if (metadata.width < 100 || metadata.height < 100) {
      throw ApiError.badRequest('Image dimensions must be at least 100x100 pixels');
    }

    if (metadata.width > 2000 || metadata.height > 2000) {
      throw ApiError.badRequest('Image dimensions must not exceed 2000x2000 pixels');
    }

    // Scan file for security
    await this.scanFile(file.buffer);

    // Generate unique filename
    const sanitizedName = this.sanitizeFilename(
      file.originalname.replace(/\.[^.]+$/, '')
    );
    const uniqueName = `logo_${userId}_${Date.now()}_${sanitizedName}`;

    try {
      // Upload to Cloudinary with transformations
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'company_logos',
            public_id: uniqueName,
            transformation: [
              { width: 500, height: 500, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      logger.info(`Logo uploaded successfully: ${result.secure_url}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        dimensions: {
          width: result.width,
          height: result.height
        }
      };
    } catch (error) {
      logger.error(`Logo upload failed: ${error.message}`);
      throw ApiError.internal('Failed to upload logo');
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = 'image') {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      logger.info(`File deleted successfully: ${publicId}`);
    } catch (error) {
      logger.error(`File deletion failed: ${error.message}`);
      // Don't throw error - deletion failure shouldn't block operations
    }
  }
}

export default new FileUploadService();
```

### 3. Enhanced Search System

#### Search Service

**File**: `server/src/modules/search/search.service.js`

```javascript
import Job from '../jobs/job.model.js';
import { JobResponseDTO } from '../jobs/job.dto.js';
import CacheUtil from '../../utils/cache.util.js';
import logger from '../../config/logger.config.js';

class SearchService {
  constructor() {
    this.cache = new CacheUtil(300000); // 5 minutes TTL
  }

  // Generate cache key from search parameters
  generateCacheKey(params) {
    return `search:${JSON.stringify(params)}`;
  }

  // Build MongoDB query from filters
  buildQuery(filters) {
    const query = { isActive: true };

    // Location filter
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    // Experience level filter
    if (filters.experienceLevel) {
      query.experienceLevel = filters.experienceLevel;
    }

    // Salary range filter
    if (filters.minSalary || filters.maxSalary) {
      query.salaryMin = {};
      if (filters.minSalary) {
        query.salaryMin.$gte = parseInt(filters.minSalary);
      }
      if (filters.maxSalary) {
        query.salaryMax = { $lte: parseInt(filters.maxSalary) };
      }
    }

    return query;
  }

  // Full-text search with filters
  async searchJobs(searchParams) {
    const {
      query: searchQuery,
      location,
      experienceLevel,
      minSalary,
      maxSalary,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = searchParams;

    // Check cache
    const cacheKey = this.generateCacheKey(searchParams);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.info('Returning cached search results');
      return cached;
    }

    const startTime = Date.now();

    // Build filter query
    const filterQuery = this.buildQuery({
      location,
      experienceLevel,
      minSalary,
      maxSalary
    });

    let jobs;
    let total;

    if (searchQuery && searchQuery.trim()) {
      // Full-text search
      const textSearchQuery = {
        $text: { $search: searchQuery },
        ...filterQuery
      };

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Determine sort order
      let sortOptions;
      if (sortBy === 'relevance') {
        sortOptions = { score: { $meta: 'textScore' } };
      } else if (sortBy === 'date') {
        sortOptions = { postedAt: -1 };
      } else if (sortBy === 'salary') {
        sortOptions = { salaryMax: -1 };
      }

      // Execute search with projection for text score
      jobs = await Job.find(textSearchQuery)
        .select({ score: { $meta: 'textScore' } })
        .sort(sortOptions)
        .limit(Math.min(limit, 1000))
        .skip(skip)
        .populate('employerId', 'companyName email')
        .lean();

      total = await Job.countDocuments(textSearchQuery);
    } else {
      // Filter-only query (no text search)
      const skip = (page - 1) * limit;

      let sortOptions = { postedAt: -1 };
      if (sortBy === 'salary') {
        sortOptions = { salaryMax: -1 };
      }

      jobs = await Job.find(filterQuery)
        .sort(sortOptions)
        .limit(Math.min(limit, 1000))
        .skip(skip)
        .populate('employerId', 'companyName email')
        .lean();

      total = await Job.countDocuments(filterQuery);
    }

    const duration = Date.now() - startTime;

    // Log slow queries
    if (duration > 500) {
      logger.warn(`Slow search query: ${duration}ms`, { searchParams });
    }

    const result = {
      jobs: jobs.map(job => new JobResponseDTO(job)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      meta: {
        duration,
        cached: false
      }
    };

    // Cache the result
    this.cache.set(cacheKey, result);

    return result;
  }

  // Save search to user history
  async saveSearchHistory(userId, searchQuery, filters) {
    // Implementation in search history module
    // This will be called from the controller
  }
}

export default new SearchService();
```


#### Search History Model

**File**: `server/src/modules/search/search-history.model.js`

```javascript
import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  filters: {
    location: String,
    experienceLevel: String,
    minSalary: Number,
    maxSalary: Number
  },
  searchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
searchHistorySchema.index({ userId: 1, searchedAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);
```

### 4. Analytics System

#### Analytics Service

**File**: `server/src/modules/analytics/analytics.service.js`

```javascript
import Job from '../jobs/job.model.js';
import Application from '../applications/application.model.js';
import User from '../users/user.model.js';
import JobView from './job-view.model.js';
import DailyStats from './daily-stats.model.js';
import CacheUtil from '../../utils/cache.util.js';
import logger from '../../config/logger.config.js';

class AnalyticsService {
  constructor() {
    this.employerCache = new CacheUtil(300000); // 5 minutes
    this.adminCache = new CacheUtil(600000); // 10 minutes
  }

  // Track job view
  async trackJobView(jobId, userId) {
    try {
      // Check if user already viewed this job
      const existingView = await JobView.findOne({ jobId, userId });
      
      if (!existingView) {
        await JobView.create({ jobId, userId });
        logger.info(`Job view tracked: ${jobId} by ${userId}`);
      }
    } catch (error) {
      logger.error(`Failed to track job view: ${error.message}`);
      // Don't throw - tracking failure shouldn't break the request
    }
  }

  // Get employer analytics
  async getEmployerAnalytics(employerId) {
    const cacheKey = `employer:${employerId}`;
    const cached = this.employerCache.get(cacheKey);
    
    if (cached) {
      // Return cached data and refresh asynchronously
      this.refreshEmployerAnalytics(employerId);
      return cached;
    }

    return await this.computeEmployerAnalytics(employerId);
  }

  async computeEmployerAnalytics(employerId) {
    const jobs = await Job.find({ employerId, isActive: true });
    const jobIds = jobs.map(j => j._id);

    // Aggregate views and applications per job
    const jobStats = await Promise.all(
      jobIds.map(async (jobId) => {
        const views = await JobView.countDocuments({ jobId });
        const applications = await Application.countDocuments({ jobId });
        const conversionRate = views > 0 
          ? ((applications / views) * 100).toFixed(2) 
          : 0;

        const job = jobs.find(j => j._id.equals(jobId));

        return {
          jobId,
          title: job.title,
          views,
          applications,
          conversionRate: parseFloat(conversionRate)
        };
      })
    );

    // Get view trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const viewTrends = await JobView.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          viewedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get application trends (last 30 days)
    const applicationTrends = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          appliedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const result = {
      jobStats,
      trends: {
        views: viewTrends.map(t => ({ date: t._id, count: t.count })),
        applications: applicationTrends.map(t => ({ date: t._id, count: t.count }))
      },
      summary: {
        totalJobs: jobs.length,
        totalViews: jobStats.reduce((sum, j) => sum + j.views, 0),
        totalApplications: jobStats.reduce((sum, j) => sum + j.applications, 0)
      }
    };

    // Cache the result
    this.employerCache.set(`employer:${employerId}`, result);

    return result;
  }

  async refreshEmployerAnalytics(employerId) {
    // Asynchronous refresh
    setTimeout(async () => {
      try {
        await this.computeEmployerAnalytics(employerId);
      } catch (error) {
        logger.error(`Failed to refresh employer analytics: ${error.message}`);
      }
    }, 0);
  }

  // Get skill demand analytics
  async getSkillDemandAnalytics(filters = {}) {
    const { location, experienceLevel } = filters;

    const matchStage = { isActive: true };
    if (location) matchStage.location = new RegExp(location, 'i');
    if (experienceLevel) matchStage.experienceLevel = experienceLevel;

    const skillDemand = await Job.aggregate([
      { $match: matchStage },
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const totalJobs = await Job.countDocuments(matchStage);

    return skillDemand.map(skill => ({
      skill: skill._id,
      count: skill.count,
      percentage: ((skill.count / totalJobs) * 100).toFixed(2)
    }));
  }

  // Get admin dashboard analytics
  async getAdminAnalytics() {
    const cacheKey = 'admin:dashboard';
    const cached = this.adminCache.get(cacheKey);

    if (cached) {
      this.refreshAdminAnalytics();
      return cached;
    }

    return await this.computeAdminAnalytics();
  }

  async computeAdminAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total counts
    const [
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      totalApplications
    ] = await Promise.all([
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Application.countDocuments()
    ]);

    // Registration trends
    const registrationTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Application activity
    const applicationActivity = await Application.aggregate([
      {
        $match: {
          appliedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Most active employers
    const activeEmployers = await Job.aggregate([
      {
        $group: {
          _id: '$employerId',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      {
        $project: {
          employerId: '$_id',
          companyName: '$employer.companyName',
          email: '$employer.email',
          jobCount: 1
        }
      }
    ]);

    // Most popular jobs
    const popularJobs = await Application.aggregate([
      {
        $group: {
          _id: '$jobId',
          applicationCount: { $sum: 1 }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          jobId: '$_id',
          title: '$job.title',
          companyName: '$job.companyName',
          applicationCount: 1
        }
      }
    ]);

    const result = {
      summary: {
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        totalApplications
      },
      trends: {
        registrations: registrationTrends.map(t => ({
          date: t._id.date,
          role: t._id.role,
          count: t.count
        })),
        applications: applicationActivity.map(t => ({
          date: t._id,
          count: t.count
        }))
      },
      topEmployers: activeEmployers,
      topJobs: popularJobs
    };

    this.adminCache.set(cacheKey, result);

    return result;
  }

  async refreshAdminAnalytics() {
    setTimeout(async () => {
      try {
        await this.computeAdminAnalytics();
      } catch (error) {
        logger.error(`Failed to refresh admin analytics: ${error.message}`);
      }
    }, 0);
  }

  // Background job to compute daily statistics
  async computeDailyStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already computed
    const existing = await DailyStats.findOne({ date: today });
    if (existing) {
      logger.info('Daily stats already computed for today');
      return;
    }

    // Compute stats for yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      newJobSeekers,
      newEmployers,
      newJobs,
      newApplications,
      totalViews
    ] = await Promise.all([
      User.countDocuments({
        role: 'jobseeker',
        createdAt: { $gte: yesterday, $lt: today }
      }),
      User.countDocuments({
        role: 'employer',
        createdAt: { $gte: yesterday, $lt: today }
      }),
      Job.countDocuments({
        createdAt: { $gte: yesterday, $lt: today }
      }),
      Application.countDocuments({
        appliedAt: { $gte: yesterday, $lt: today }
      }),
      JobView.countDocuments({
        viewedAt: { $gte: yesterday, $lt: today }
      })
    ]);

    await DailyStats.create({
      date: yesterday,
      newJobSeekers,
      newEmployers,
      newJobs,
      newApplications,
      totalViews
    });

    logger.info(`Daily stats computed for ${yesterday.toISOString()}`);
  }
}

export default new AnalyticsService();
```


#### Analytics Models

**File**: `server/src/modules/analytics/job-view.model.js`

```javascript
import mongoose from 'mongoose';

const jobViewSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Compound index for unique views
jobViewSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export default mongoose.model('JobView', jobViewSchema);
```

**File**: `server/src/modules/analytics/daily-stats.model.js`

```javascript
import mongoose from 'mongoose';

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  newJobSeekers: {
    type: Number,
    default: 0
  },
  newEmployers: {
    type: Number,
    default: 0
  },
  newJobs: {
    type: Number,
    default: 0
  },
  newApplications: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('DailyStats', dailyStatsSchema);
```

### 5. AI Matching System

#### Matching Service

**File**: `server/src/modules/matching/matching.service.js`

```javascript
import Job from '../jobs/job.model.js';
import User from '../users/user.model.js';
import Application from '../applications/application.model.js';
import SkillTaxonomy from './skill-taxonomy.model.js';
import CacheUtil from '../../utils/cache.util.js';
import logger from '../../config/logger.config.js';

class MatchingService {
  constructor() {
    this.cache = new CacheUtil(3600000); // 1 hour TTL
    this.EXACT_MATCH_WEIGHT = 2.0;
    this.CATEGORY_MATCH_WEIGHT = 1.5;
    this.RELATED_MATCH_WEIGHT = 1.0;
  }

  // Get skill taxonomy data
  async getSkillRelations(skillName) {
    const taxonomy = await SkillTaxonomy.findOne({ 
      skillName: new RegExp(`^${skillName}$`, 'i') 
    });
    return taxonomy || { category: null, relatedSkills: [] };
  }

  // Calculate experience level multiplier
  getExperienceLevelMultiplier(jobSeekerLevel, jobLevel) {
    const levels = { entry: 0, mid: 1, senior: 2 };
    const seekerLevelNum = levels[jobSeekerLevel] || 0;
    const jobLevelNum = levels[jobLevel] || 0;

    const difference = Math.abs(seekerLevelNum - jobLevelNum);

    if (difference === 0) return 1.0;
    if (difference === 1) return 0.8;
    return 0.5;
  }

  // Calculate skill score for a job seeker and job
  async calculateSkillScore(jobSeekerId, jobId) {
    // Check cache
    const cacheKey = `score:${jobSeekerId}:${jobId}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== undefined) return cached;

    const startTime = Date.now();

    // Fetch job seeker and job
    const [jobSeeker, job] = await Promise.all([
      User.findById(jobSeekerId).select('skills experienceLevel').lean(),
      Job.findById(jobId).select('requiredSkills experienceLevel').lean()
    ]);

    if (!jobSeeker || !job) {
      return 0;
    }

    const jobSeekerSkills = jobSeeker.skills || [];
    const requiredSkills = job.requiredSkills || [];

    if (requiredSkills.length === 0) {
      return 0;
    }

    // Calculate weighted skill matches
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const requiredSkill of requiredSkills) {
      const requiredSkillLower = requiredSkill.toLowerCase();
      let skillMatched = false;
      let matchWeight = 0;

      // Check for exact match
      for (const userSkill of jobSeekerSkills) {
        if (userSkill.toLowerCase() === requiredSkillLower) {
          matchWeight = this.EXACT_MATCH_WEIGHT;
          skillMatched = true;
          break;
        }
      }

      // Check for category or related match if no exact match
      if (!skillMatched) {
        const taxonomy = await this.getSkillRelations(requiredSkill);
        
        for (const userSkill of jobSeekerSkills) {
          const userSkillLower = userSkill.toLowerCase();
          
          // Check category match
          if (taxonomy.category) {
            const userTaxonomy = await this.getSkillRelations(userSkill);
            if (userTaxonomy.category === taxonomy.category) {
              matchWeight = Math.max(matchWeight, this.CATEGORY_MATCH_WEIGHT);
              skillMatched = true;
            }
          }

          // Check related skills
          if (taxonomy.relatedSkills.some(
            rs => rs.toLowerCase() === userSkillLower
          )) {
            matchWeight = Math.max(matchWeight, this.RELATED_MATCH_WEIGHT);
            skillMatched = true;
          }
        }
      }

      totalWeight += this.EXACT_MATCH_WEIGHT;
      matchedWeight += matchWeight;
    }

    // Calculate base score (0-100)
    let baseScore = totalWeight > 0 
      ? (matchedWeight / totalWeight) * 100 
      : 0;

    // Apply experience level multiplier
    const expMultiplier = this.getExperienceLevelMultiplier(
      jobSeeker.experienceLevel,
      job.experienceLevel
    );

    const finalScore = Math.min(100, baseScore * expMultiplier);

    const duration = Date.now() - startTime;
    if (duration > 100) {
      logger.warn(`Slow skill score calculation: ${duration}ms`);
    }

    // Cache the result
    this.cache.set(cacheKey, finalScore);

    return Math.round(finalScore);
  }

  // Get skill gap analysis
  async getSkillGap(jobSeekerId, jobId) {
    const [jobSeeker, job] = await Promise.all([
      User.findById(jobSeekerId).select('skills').lean(),
      Job.findById(jobId).select('requiredSkills').lean()
    ]);

    if (!jobSeeker || !job) {
      throw ApiError.notFound('Job seeker or job not found');
    }

    const jobSeekerSkills = (jobSeeker.skills || []).map(s => s.toLowerCase());
    const requiredSkills = job.requiredSkills || [];

    const matchedSkills = [];
    const missingSkills = [];

    for (const requiredSkill of requiredSkills) {
      const requiredSkillLower = requiredSkill.toLowerCase();
      
      if (jobSeekerSkills.includes(requiredSkillLower)) {
        matchedSkills.push({
          skill: requiredSkill,
          weight: this.EXACT_MATCH_WEIGHT
        });
      } else {
        // Check for related matches
        const taxonomy = await this.getSkillRelations(requiredSkill);
        let hasRelatedMatch = false;

        for (const userSkill of jobSeeker.skills) {
          const userTaxonomy = await this.getSkillRelations(userSkill);
          
          if (taxonomy.category && userTaxonomy.category === taxonomy.category) {
            matchedSkills.push({
              skill: requiredSkill,
              matchedVia: userSkill,
              weight: this.CATEGORY_MATCH_WEIGHT
            });
            hasRelatedMatch = true;
            break;
          }
        }

        if (!hasRelatedMatch) {
          missingSkills.push({
            skill: requiredSkill,
            weight: this.EXACT_MATCH_WEIGHT
          });
        }
      }
    }

    // Sort by weight (importance)
    matchedSkills.sort((a, b) => b.weight - a.weight);
    missingSkills.sort((a, b) => b.weight - a.weight);

    const matchPercentage = requiredSkills.length > 0
      ? ((matchedSkills.length / requiredSkills.length) * 100).toFixed(2)
      : 0;

    return {
      matchedSkills,
      missingSkills,
      matchPercentage: parseFloat(matchPercentage),
      totalRequired: requiredSkills.length
    };
  }

  // Generate job recommendations for a job seeker
  async getJobRecommendations(jobSeekerId, limit = 10) {
    const jobSeeker = await User.findById(jobSeekerId).select('skills experienceLevel');
    
    if (!jobSeeker) {
      throw ApiError.notFound('Job seeker not found');
    }

    // Get jobs the user has already applied to or dismissed
    const appliedJobIds = await Application.find({ 
      jobSeekerId 
    }).distinct('jobId');

    // Get active jobs (limit to 100 for performance)
    const jobs = await Job.find({
      isActive: true,
      _id: { $nin: appliedJobIds }
    })
    .limit(100)
    .lean();

    // Calculate scores for each job
    const scoredJobs = await Promise.all(
      jobs.map(async (job) => {
        const score = await this.calculateSkillScore(jobSeekerId, job._id);
        return {
          job,
          score
        };
      })
    );

    // Filter jobs with score > 60 and sort by score
    const recommendations = scoredJobs
      .filter(sj => sj.score > 60)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sj => ({
        ...sj.job,
        matchScore: sj.score
      }));

    return recommendations;
  }

  // Generate candidate recommendations for a job
  async getCandidateRecommendations(jobId, limit = 20) {
    const job = await Job.findById(jobId).select('requiredSkills experienceLevel');
    
    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    // Get users who have already applied
    const appliedUserIds = await Application.find({ 
      jobId 
    }).distinct('jobSeekerId');

    // Get job seekers with relevant skills
    const jobSeekers = await User.find({
      role: 'jobseeker',
      _id: { $nin: appliedUserIds },
      skills: { $in: job.requiredSkills }
    })
    .limit(100)
    .lean();

    // Calculate scores for each candidate
    const scoredCandidates = await Promise.all(
      jobSeekers.map(async (jobSeeker) => {
        const score = await this.calculateSkillScore(jobSeeker._id, jobId);
        
        // Count matched skills
        const matchedSkillsCount = jobSeeker.skills.filter(skill =>
          job.requiredSkills.some(rs => 
            rs.toLowerCase() === skill.toLowerCase()
          )
        ).length;

        return {
          jobSeeker,
          score,
          matchedSkillsCount
        };
      })
    );

    // Filter candidates with score > 70 and sort by score
    const recommendations = scoredCandidates
      .filter(sc => sc.score > 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sc => ({
        userId: sc.jobSeeker._id,
        name: sc.jobSeeker.name,
        email: sc.jobSeeker.email,
        skills: sc.jobSeeker.skills,
        experienceLevel: sc.jobSeeker.experienceLevel,
        matchScore: sc.score,
        matchedSkillsCount: sc.matchedSkillsCount
      }));

    return recommendations;
  }

  // Invalidate cache for a user or job
  invalidateCache(entityId) {
    // Remove all cache entries containing this entity ID
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.includes(entityId)) {
        this.cache.delete(key);
      }
    });
  }
}

export default new MatchingService();
```


#### Skill Taxonomy Model

**File**: `server/src/modules/matching/skill-taxonomy.model.js`

```javascript
import mongoose from 'mongoose';

const skillTaxonomySchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  relatedSkills: [{
    type: String,
    trim: true
  }],
  aliases: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export default mongoose.model('SkillTaxonomy', skillTaxonomySchema);
```

## Data Models

### Updated Job Model

The existing Job model needs to be extended with additional fields:

```javascript
// Add to existing job.model.js
const jobSchema = new mongoose.Schema({
  // ... existing fields ...
  
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    required: true
  },
  salaryMin: {
    type: Number,
    required: false
  },
  salaryMax: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

// Add text index for full-text search
jobSchema.index({ 
  title: 'text', 
  description: 'text', 
  requiredSkills: 'text' 
});

// Add compound indexes for filtering
jobSchema.index({ location: 1, experienceLevel: 1 });
jobSchema.index({ salaryMin: 1, salaryMax: 1 });
jobSchema.index({ isActive: 1, postedAt: -1 });
```

### Updated User Model

The existing User model needs to be extended:

```javascript
// Add to existing user.model.js
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // For job seekers
  skills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    required: function() {
      return this.role === 'jobseeker';
    }
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  resumePublicId: {
    type: String,
    trim: true
  },
  
  // For employers
  companyLogoUrl: {
    type: String,
    trim: true
  },
  companyLogoPublicId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});
```

### Database Indexes Summary

Critical indexes for performance:

1. **Job Collection**:
   - Text index: `{ title: 'text', description: 'text', requiredSkills: 'text' }`
   - Compound: `{ location: 1, experienceLevel: 1 }`
   - Compound: `{ isActive: 1, postedAt: -1 }`
   - Range: `{ salaryMin: 1, salaryMax: 1 }`

2. **Notification Collection**:
   - Compound: `{ userId: 1, isRead: 1, createdAt: -1 }`
   - Compound: `{ userId: 1, type: 1 }`
   - TTL: `{ createdAt: 1 }` with 90-day expiration

3. **JobView Collection**:
   - Unique compound: `{ jobId: 1, userId: 1 }`
   - Single: `{ viewedAt: 1 }`

4. **SearchHistory Collection**:
   - Compound: `{ userId: 1, searchedAt: -1 }`

5. **SkillTaxonomy Collection**:
   - Unique: `{ skillName: 1 }`
   - Single: `{ category: 1 }`


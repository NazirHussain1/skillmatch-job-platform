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


# Data Integrity & Scalability Implementation

## Overview
This document describes the data integrity improvements and scalability refinements implemented to prepare the system for horizontal scaling and ensure data consistency.

---

## 1. MongoDB Transactions

### Implementation
MongoDB transactions ensure ACID properties for critical operations involving multiple collections.

### Use Cases

#### Job Application Creation
```javascript
// Transaction ensures atomicity of:
// 1. Create application
// 2. Increment job application count
// 3. Create notification
const session = await mongoose.startSession();
session.startTransaction();

try {
  const application = await Application.create([data], { session });
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } }, { session });
  await Notification.create([notificationData], { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

#### Application Status Update
```javascript
// Transaction ensures:
// 1. Update application status
// 2. Create status change notification
// Both succeed or both fail
```

### Benefits
- **Atomicity**: All operations succeed or all fail
- **Consistency**: Data remains consistent across collections
- **Isolation**: Concurrent operations don't interfere
- **Durability**: Committed changes persist

---

## 2. Soft Delete with deletedAt Field

### Implementation
All models now support soft delete instead of hard delete.

### Schema Changes
```javascript
{
  deletedAt: {
    type: Date,
    default: null
  }
}
```

### Query Middleware
```javascript
// Automatically exclude soft-deleted documents
applicationSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});
```

### Instance Methods
```javascript
// Soft delete
await document.softDelete();

// Restore
await document.restore();

// Find including deleted
Model.findWithDeleted(conditions);
```

### Benefits
- **Data Recovery**: Deleted data can be restored
- **Audit Trail**: Track when data was deleted
- **Compliance**: Meet data retention requirements
- **Safety**: Prevent accidental data loss

---

## 3. Data Validation Hooks

### Pre-Save Validation
```javascript
// Validate status transitions
applicationSchema.pre('save', function(next) {
  const validTransitions = {
    'Pending': ['Reviewing', 'Rejected'],
    'Reviewing': ['Interviewing', 'Accepted', 'Rejected'],
    'Interviewing': ['Accepted', 'Rejected'],
    'Accepted': [],
    'Rejected': []
  };

  if (invalid transition) {
    return next(new Error('Invalid status transition'));
  }
  next();
});
```

### Benefits
- **Business Logic Enforcement**: Ensure valid state transitions
- **Data Integrity**: Prevent invalid data at database level
- **Consistency**: Rules enforced across all code paths

---

## 4. Optimistic Concurrency Control

### Implementation
```javascript
const schema = new mongoose.Schema({
  // ... fields
}, {
  optimisticConcurrency: true // Adds __v version key
});
```

### How It Works
1. Document loaded with version `__v: 0`
2. User A and User B both load the document
3. User A updates and saves → `__v: 1`
4. User B tries to save → Error (version mismatch)
5. User B must reload and retry

### Benefits
- **Prevents Lost Updates**: Detect concurrent modifications
- **No Locking Required**: Better performance than pessimistic locking
- **Automatic**: Mongoose handles version checking

### Example
```javascript
try {
  application.status = 'Accepted';
  await application.save();
} catch (error) {
  if (error.name === 'VersionError') {
    // Document was modified by another process
    // Reload and retry
  }
}
```

---

## 5. Stateless Backend

### Token Blacklist in Redis
```javascript
// Add token to blacklist
await tokenBlacklist.add(token, 900); // 15 min TTL

// Check if blacklisted
const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
```

### Benefits
- **No Server State**: Tokens stored in Redis, not memory
- **Horizontal Scaling**: Any server can validate tokens
- **Automatic Cleanup**: TTL expires tokens automatically
- **Fallback**: In-memory fallback if Redis unavailable

### Session Management
- No server-side sessions
- JWT tokens are stateless
- Refresh tokens stored in database
- Blacklist only for revoked tokens

---

## 6. Redis Adapter for Socket.IO

### Implementation
```javascript
import { createAdapter } from '@socket.io/redis-adapter';

if (isRedisAvailable()) {
  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
}
```

### Benefits
- **Multi-Server Support**: Events broadcast across all servers
- **Sticky Sessions Not Required**: Users can connect to any server
- **Room Synchronization**: Rooms work across all instances
- **Scalability**: Add more servers without code changes

### How It Works
```
Server 1                    Redis                    Server 2
   |                          |                          |
   |-- emit('event') -------->|                          |
   |                          |-- broadcast ------------>|
   |                          |                          |-- deliver to clients
```

---

## 7. Redis-Backed Rate Limiter

### Implementation
```javascript
export const createRedisRateLimiter = (options) => {
  const limiterOptions = {
    windowMs,
    max,
    store: new RedisStore({ prefix })
  };
  return rateLimit(limiterOptions);
};
```

### Pre-Configured Limiters
```javascript
// General API (100 req/15min)
generalLimiter

// Authentication (5 req/15min)
authLimiter

// File Upload (10 req/15min)
uploadLimiter

// Search (30 req/1min)
searchLimiter
```

### Benefits
- **Distributed Rate Limiting**: Works across all servers
- **Redis Storage**: Shared state in Redis
- **Automatic Cleanup**: TTL expires old counters
- **Fallback**: Memory store if Redis unavailable

---

## 8. Horizontal Scaling Architecture

### Before (Single Server)
```
Load Balancer
      |
   Server
      |
   Database
```

### After (Horizontally Scalable)
```
Load Balancer
      |
   +-+-+-+
   |  |  |
  S1 S2 S3  (Stateless Servers)
   |  |  |
   +-+-+-+
      |
   Redis (Shared State)
      |
   MongoDB (Database)
```

### Stateless Server Checklist
- ✅ JWT tokens (no sessions)
- ✅ Token blacklist in Redis
- ✅ Rate limiting in Redis
- ✅ Socket.IO with Redis adapter
- ✅ Cache in Redis
- ✅ No in-memory state

### Deployment Considerations
1. **Load Balancer**: Round-robin or least connections
2. **Redis**: Single Redis instance or Redis Cluster
3. **MongoDB**: Replica Set for high availability
4. **Sticky Sessions**: NOT required
5. **Health Checks**: Use `/health/ready` endpoint

---

## 9. Configuration

### Environment Variables
```env
# Redis (required for horizontal scaling)
REDIS_URL=redis://localhost:6379

# MongoDB (use replica set for transactions)
MONGODB_URI=mongodb+srv://user:pass@cluster/db?replicaSet=rs0

# JWT
JWT_SECRET=your_secret
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d
```

### Package Dependencies
```json
{
  "dependencies": {
    "@socket.io/redis-adapter": "^8.0.0",
    "ioredis": "^5.9.3",
    "mongoose": "^8.0.0",
    "express-rate-limit": "^8.2.1"
  }
}
```

---

## 10. Testing Transactions

### Test Transaction Rollback
```javascript
// Simulate error to test rollback
const session = await mongoose.startSession();
session.startTransaction();

try {
  await Application.create([data], { session });
  throw new Error('Simulated error');
  await Notification.create([notificationData], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // Both operations rolled back
}
```

### Test Optimistic Concurrency
```javascript
// Load same document twice
const doc1 = await Application.findById(id);
const doc2 = await Application.findById(id);

// Update first
doc1.status = 'Accepted';
await doc1.save(); // Success, __v: 1

// Try to update second
doc2.status = 'Rejected';
await doc2.save(); // Error: VersionError
```

---

## 11. Monitoring

### Transaction Metrics
```javascript
// Log transaction success/failure
logger.info('Transaction committed', { correlationId, duration });
logger.error('Transaction aborted', { correlationId, error });
```

### Concurrency Conflicts
```javascript
// Monitor version errors
if (error.name === 'VersionError') {
  logger.warn('Optimistic concurrency conflict', { 
    documentId, 
    correlationId 
  });
}
```

### Redis Health
```bash
# Check Redis connection
curl http://localhost:5000/health/ready

# Check rate limiter
curl http://localhost:5000/health/metrics | jq '.cache'
```

---

## 12. Migration Guide

### Enable Transactions
1. Ensure MongoDB is running as replica set
2. Update connection string to include `replicaSet` parameter
3. Transactions will work automatically

### Add Soft Delete to Existing Models
```javascript
// 1. Add deletedAt field to schema
deletedAt: { type: Date, default: null }

// 2. Add query middleware
schema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null });
  }
  next();
});

// 3. Add instance methods
schema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};
```

### Enable Redis for Scaling
```bash
# 1. Install Redis
brew install redis  # macOS
apt-get install redis  # Ubuntu

# 2. Start Redis
redis-server

# 3. Update .env
REDIS_URL=redis://localhost:6379

# 4. Restart application
npm start
```

---

## 13. Best Practices

### Transactions
- ✅ Use for multi-collection operations
- ✅ Keep transactions short
- ✅ Always use try-catch-finally
- ✅ Log transaction outcomes
- ❌ Don't nest transactions
- ❌ Don't hold transactions open long

### Soft Delete
- ✅ Use for user-facing data
- ✅ Add index on deletedAt
- ✅ Periodically clean old deleted data
- ❌ Don't soft delete sensitive data
- ❌ Don't forget to exclude in queries

### Optimistic Concurrency
- ✅ Enable on frequently updated documents
- ✅ Handle VersionError gracefully
- ✅ Implement retry logic
- ❌ Don't ignore version errors
- ❌ Don't disable for critical data

### Horizontal Scaling
- ✅ Use Redis for shared state
- ✅ Make all servers identical
- ✅ Use health checks
- ✅ Monitor Redis connection
- ❌ Don't store state in memory
- ❌ Don't require sticky sessions

---

## 14. Performance Impact

### Transactions
- **Overhead**: ~5-10ms per transaction
- **Benefit**: Data consistency guaranteed
- **Recommendation**: Use for critical operations only

### Soft Delete
- **Overhead**: Minimal (index lookup)
- **Benefit**: Data recovery capability
- **Recommendation**: Use for all user data

### Optimistic Concurrency
- **Overhead**: Minimal (version check)
- **Benefit**: Prevents lost updates
- **Recommendation**: Enable on all models

### Redis
- **Overhead**: ~1-2ms per operation
- **Benefit**: Horizontal scalability
- **Recommendation**: Required for multi-server

---

## 15. Troubleshooting

### Transaction Errors
```
Error: Transaction numbers are only allowed on a replica set member
Solution: Run MongoDB as replica set
```

### Version Errors
```
Error: VersionError: No matching document found
Solution: Reload document and retry operation
```

### Redis Connection
```
Error: Redis connection failed
Solution: Check REDIS_URL and Redis server status
```

### Socket.IO Adapter
```
Warning: Socket.IO running without Redis adapter
Solution: Ensure Redis is available and connected
```

---

## Summary

### Data Integrity ✅
- MongoDB transactions for atomic operations
- Soft delete with deletedAt field
- Data validation hooks
- Optimistic concurrency control

### Scalability ✅
- Fully stateless backend
- Token blacklist in Redis
- Redis adapter for Socket.IO
- Redis-backed rate limiter
- No sticky sessions required

### Production Ready ✅
- Horizontal scaling support
- High availability
- Data consistency
- Audit trail
- Recovery capability

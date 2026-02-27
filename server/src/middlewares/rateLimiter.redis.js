import rateLimit from 'express-rate-limit';
import { getRedis, isRedisAvailable } from '../config/redis.js';
import logger from '../utils/logger.js';

// Redis store for rate limiting (for horizontal scaling)
class RedisStore {
  constructor(options = {}) {
    this.prefix = options.prefix || 'rl:';
    this.resetExpiryOnChange = options.resetExpiryOnChange || false;
  }

  async increment(key) {
    if (!isRedisAvailable()) {
      // Fallback to memory store (handled by express-rate-limit)
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }

    try {
      const redis = getRedis();
      const fullKey = `${this.prefix}${key}`;
      
      const [[, totalHits], [, ttl]] = await redis
        .multi()
        .incr(fullKey)
        .ttl(fullKey)
        .exec();

      let resetTime;
      if (ttl === -1) {
        // Key has no expiry, set it
        await redis.expire(fullKey, 60); // 60 seconds default
        resetTime = new Date(Date.now() + 60000);
      } else {
        resetTime = new Date(Date.now() + ttl * 1000);
      }

      return {
        totalHits,
        resetTime
      };
    } catch (error) {
      logger.error('Redis rate limiter error', { error: error.message });
      // Fallback to allowing the request
      return { totalHits: 1, resetTime: new Date(Date.now() + 60000) };
    }
  }

  async decrement(key) {
    if (!isRedisAvailable()) return;

    try {
      const redis = getRedis();
      const fullKey = `${this.prefix}${key}`;
      await redis.decr(fullKey);
    } catch (error) {
      logger.error('Redis rate limiter decrement error', { error: error.message });
    }
  }

  async resetKey(key) {
    if (!isRedisAvailable()) return;

    try {
      const redis = getRedis();
      const fullKey = `${this.prefix}${key}`;
      await redis.del(fullKey);
    } catch (error) {
      logger.error('Redis rate limiter reset error', { error: error.message });
    }
  }
}

// Create rate limiters with Redis backing
export const createRedisRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later',
    prefix = 'rl:',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  const limiterOptions = {
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        correlationId: req.correlationId,
        ip: req.ip,
        path: req.path
      });
      
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  };

  // Use Redis store if available
  if (isRedisAvailable()) {
    limiterOptions.store = new RedisStore({ prefix });
    logger.info('Rate limiter using Redis store');
  } else {
    logger.warn('Rate limiter using memory store (Redis unavailable)');
  }

  return rateLimit(limiterOptions);
};

// Pre-configured rate limiters
export const generalLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  prefix: 'rl:general:'
});

export const authLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  prefix: 'rl:auth:',
  skipSuccessfulRequests: true
});

export const uploadLimiter = createRedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many upload requests, please try again later',
  prefix: 'rl:upload:'
});

export const searchLimiter = createRedisRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Too many search requests, please slow down',
  prefix: 'rl:search:',
  skipSuccessfulRequests: true
});

export default {
  createRedisRateLimiter,
  generalLimiter,
  authLimiter,
  uploadLimiter,
  searchLimiter
};

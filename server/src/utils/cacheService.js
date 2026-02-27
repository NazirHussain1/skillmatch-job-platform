import crypto from 'crypto';
import { getRedis, isRedisAvailable } from '../config/redis.js';

class CacheService {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
  }

  // Generate cache key from query and filters
  generateCacheKey(prefix, data) {
    const dataString = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(dataString).digest('hex');
    return `${prefix}:${hash}`;
  }

  // Get cached data
  async get(key) {
    if (!isRedisAvailable()) {
      return null;
    }

    try {
      const redis = getRedis();
      const data = await redis.get(key);
      
      if (data) {
        // Record cache hit
        if (global.metrics) {
          global.metrics.recordCacheHit();
        }
        return JSON.parse(data);
      }
      
      // Record cache miss
      if (global.metrics) {
        global.metrics.recordCacheMiss();
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  }

  // Set cached data
  async set(key, data, ttl = this.defaultTTL) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const redis = getRedis();
      await redis.setex(key, ttl, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Cache set error:', error.message);
      return false;
    }
  }

  // Delete cached data
  async del(key) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const redis = getRedis();
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error.message);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const redis = getRedis();
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error.message);
      return false;
    }
  }

  // Clear all cache
  async flush() {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const redis = getRedis();
      await redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error.message);
      return false;
    }
  }

  // Check if key exists
  async exists(key) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const redis = getRedis();
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error.message);
      return false;
    }
  }

  // Get TTL of a key
  async ttl(key) {
    if (!isRedisAvailable()) {
      return -1;
    }

    try {
      const redis = getRedis();
      return await redis.ttl(key);
    } catch (error) {
      console.error('Cache TTL error:', error.message);
      return -1;
    }
  }

  // Increment counter
  async incr(key, ttl = this.defaultTTL) {
    if (!isRedisAvailable()) {
      return 0;
    }

    try {
      const redis = getRedis();
      const value = await redis.incr(key);
      
      // Set expiry on first increment
      if (value === 1) {
        await redis.expire(key, ttl);
      }
      
      return value;
    } catch (error) {
      console.error('Cache increment error:', error.message);
      return 0;
    }
  }
}

export default new CacheService();

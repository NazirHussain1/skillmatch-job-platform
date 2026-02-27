import { getRedis, isRedisAvailable } from '../config/redis.js';
import logger from './logger.js';

class TokenBlacklist {
  constructor() {
    this.prefix = 'blacklist:token:';
    this.fallbackSet = new Set(); // In-memory fallback if Redis unavailable
  }

  // Add token to blacklist
  async add(token, expiresIn = 900) { // Default 15 minutes
    if (isRedisAvailable()) {
      try {
        const redis = getRedis();
        const key = `${this.prefix}${token}`;
        await redis.setex(key, expiresIn, '1');
        
        logger.info('Token blacklisted in Redis', { tokenPrefix: token.substring(0, 10) });
        return true;
      } catch (error) {
        logger.error('Failed to blacklist token in Redis', { error: error.message });
        // Fallback to in-memory
        this.fallbackSet.add(token);
        return true;
      }
    } else {
      // Use in-memory fallback
      this.fallbackSet.add(token);
      
      // Auto-cleanup after expiry
      setTimeout(() => {
        this.fallbackSet.delete(token);
      }, expiresIn * 1000);
      
      logger.warn('Token blacklisted in memory (Redis unavailable)', { 
        tokenPrefix: token.substring(0, 10) 
      });
      return true;
    }
  }

  // Check if token is blacklisted
  async isBlacklisted(token) {
    if (isRedisAvailable()) {
      try {
        const redis = getRedis();
        const key = `${this.prefix}${token}`;
        const result = await redis.exists(key);
        return result === 1;
      } catch (error) {
        logger.error('Failed to check token blacklist in Redis', { error: error.message });
        // Fallback to in-memory
        return this.fallbackSet.has(token);
      }
    } else {
      // Use in-memory fallback
      return this.fallbackSet.has(token);
    }
  }

  // Remove token from blacklist (for testing or manual intervention)
  async remove(token) {
    if (isRedisAvailable()) {
      try {
        const redis = getRedis();
        const key = `${this.prefix}${token}`;
        await redis.del(key);
        return true;
      } catch (error) {
        logger.error('Failed to remove token from blacklist in Redis', { error: error.message });
        this.fallbackSet.delete(token);
        return true;
      }
    } else {
      this.fallbackSet.delete(token);
      return true;
    }
  }

  // Clear all blacklisted tokens (for testing)
  async clear() {
    if (isRedisAvailable()) {
      try {
        const redis = getRedis();
        const keys = await redis.keys(`${this.prefix}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        logger.info('Token blacklist cleared in Redis');
        return true;
      } catch (error) {
        logger.error('Failed to clear token blacklist in Redis', { error: error.message });
        this.fallbackSet.clear();
        return true;
      }
    } else {
      this.fallbackSet.clear();
      logger.info('Token blacklist cleared in memory');
      return true;
    }
  }

  // Get blacklist size (for monitoring)
  async size() {
    if (isRedisAvailable()) {
      try {
        const redis = getRedis();
        const keys = await redis.keys(`${this.prefix}*`);
        return keys.length;
      } catch (error) {
        logger.error('Failed to get blacklist size from Redis', { error: error.message });
        return this.fallbackSet.size;
      }
    } else {
      return this.fallbackSet.size;
    }
  }
}

export default new TokenBlacklist();

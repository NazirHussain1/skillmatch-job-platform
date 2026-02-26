import Redis from 'ioredis';

let redisClient = null;

// Initialize Redis client
export const initRedis = () => {
  try {
    // Check if Redis is configured
    if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Redis not configured. Caching will be disabled.');
      return null;
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      // Don't crash the app if Redis fails
      redisClient = null;
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis is ready');
    });

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    return null;
  }
};

// Get Redis client
export const getRedis = () => {
  return redisClient;
};

// Check if Redis is available
export const isRedisAvailable = () => {
  return redisClient !== null && redisClient.status === 'ready';
};

// Graceful shutdown
export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    console.log('👋 Redis connection closed');
  }
};

export default {
  initRedis,
  getRedis,
  isRedisAvailable,
  closeRedis
};

import express from 'express';
import mongoose from 'mongoose';
import { isRedisAvailable } from '../config/redis.js';
import metricsCollector from '../utils/metrics.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Liveness probe - checks if the application is running
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe - checks if the application is ready to serve traffic
router.get('/ready', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    overall: false
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      checks.database = true;
    }

    // Check Redis connection (optional)
    checks.redis = isRedisAvailable() || 'not_configured';

    // Overall health
    checks.overall = checks.database;

    const statusCode = checks.overall ? 200 : 503;

    res.status(statusCode).json({
      status: checks.overall ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', {
      correlationId: req.correlationId,
      error: error.message
    });

    res.status(503).json({
      status: 'not_ready',
      checks,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: {
        status: 'unknown',
        responseTime: null
      },
      redis: {
        status: 'unknown',
        responseTime: null
      }
    },
    system: {
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: ((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100).toFixed(2) + '%'
      },
      cpu: process.cpuUsage()
    }
  };

  try {
    // Check MongoDB
    const dbStart = Date.now();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.services.database.status = 'healthy';
      health.services.database.responseTime = `${Date.now() - dbStart}ms`;
    } else {
      health.services.database.status = 'unhealthy';
      health.status = 'degraded';
    }

    // Check Redis
    if (isRedisAvailable()) {
      const redisStart = Date.now();
      const { getRedis } = await import('../config/redis.js');
      const redis = getRedis();
      await redis.ping();
      health.services.redis.status = 'healthy';
      health.services.redis.responseTime = `${Date.now() - redisStart}ms`;
    } else {
      health.services.redis.status = 'not_configured';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Detailed health check failed', {
      correlationId: req.correlationId,
      error: error.message
    });

    health.status = 'unhealthy';
    res.status(503).json({
      ...health,
      error: error.message
    });
  }
});

// Metrics endpoint (JSON format)
router.get('/metrics', (req, res) => {
  const metrics = metricsCollector.getMetrics();
  res.json(metrics);
});

// Prometheus metrics endpoint
router.get('/metrics/prometheus', (req, res) => {
  const prometheusMetrics = metricsCollector.getPrometheusMetrics();
  res.set('Content-Type', 'text/plain');
  res.send(prometheusMetrics);
});

export default router;

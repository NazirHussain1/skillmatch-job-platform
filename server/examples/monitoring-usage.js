/**
 * Examples of using the monitoring, metrics, and logging system
 */

import logger from '../src/utils/logger.js';
import metricsCollector from '../src/utils/metrics.js';

// ============================================
// LOGGING EXAMPLES
// ============================================

// Basic logging
logger.info('Application started');
logger.warn('This is a warning');
logger.error('An error occurred');

// Logging with metadata
logger.info('User logged in', {
  userId: '123',
  email: 'user@example.com',
  ip: '192.168.1.1'
});

// Logging with correlation ID (in middleware context)
logger.info('Processing request', {
  correlationId: 'abc-123-def',
  method: 'GET',
  url: '/api/jobs'
});

// Sensitive data is automatically masked
logger.info('Authentication attempt', {
  email: 'user@example.com',
  password: 'secret123',  // Will be masked as ***MASKED***
  token: 'jwt-token-here'  // Will be masked as ***MASKED***
});

// ============================================
// METRICS EXAMPLES
// ============================================

// Record HTTP request (usually done by middleware)
metricsCollector.recordRequest('GET', '/api/jobs', 200, 45);
metricsCollector.recordRequest('POST', '/api/auth/login', 401, 120);

// Record database query
metricsCollector.recordDbQuery(15); // 15ms query duration

// Record cache operations
metricsCollector.recordCacheHit();
metricsCollector.recordCacheMiss();

// Get current metrics
const metrics = metricsCollector.getMetrics();
console.log('Current Metrics:', JSON.stringify(metrics, null, 2));

// Get Prometheus format metrics
const prometheusMetrics = metricsCollector.getPrometheusMetrics();
console.log('Prometheus Metrics:\n', prometheusMetrics);

// ============================================
// HEALTH CHECK EXAMPLES
// ============================================

// Example: Custom health check in your service
async function checkServiceHealth() {
  try {
    // Check database
    const dbHealthy = await checkDatabase();
    
    // Check external API
    const apiHealthy = await checkExternalAPI();
    
    if (dbHealthy && apiHealthy) {
      logger.info('Health check passed');
      return { status: 'healthy' };
    } else {
      logger.warn('Health check failed', {
        database: dbHealthy,
        externalAPI: apiHealthy
      });
      return { status: 'unhealthy' };
    }
  } catch (error) {
    logger.error('Health check error', {
      error: error.message,
      stack: error.stack
    });
    return { status: 'error', error: error.message };
  }
}

async function checkDatabase() {
  // Simulate database check
  return true;
}

async function checkExternalAPI() {
  // Simulate external API check
  return true;
}

// ============================================
// CORRELATION ID EXAMPLES
// ============================================

// In Express middleware
function exampleMiddleware(req, res, next) {
  // Correlation ID is automatically added by correlationIdMiddleware
  const correlationId = req.correlationId;
  
  logger.info('Processing request', {
    correlationId,
    method: req.method,
    url: req.url
  });
  
  // Pass correlation ID to services
  someService.doSomething(correlationId);
  
  next();
}

// In service layer
class ExampleService {
  async doSomething(correlationId) {
    logger.info('Service method called', {
      correlationId,
      action: 'doSomething'
    });
    
    try {
      // Do work
      const result = await performWork();
      
      logger.info('Service method completed', {
        correlationId,
        result
      });
      
      return result;
    } catch (error) {
      logger.error('Service method failed', {
        correlationId,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
}

async function performWork() {
  return { success: true };
}

// ============================================
// MONITORING BEST PRACTICES
// ============================================

/**
 * 1. Always include correlation IDs in logs
 * 2. Log at appropriate levels (info for normal flow, error for failures)
 * 3. Include relevant context in log metadata
 * 4. Don't log sensitive data (it will be masked, but avoid it)
 * 5. Monitor metrics regularly
 * 6. Set up alerts for:
 *    - Error rate > 5%
 *    - Response time > 500ms
 *    - Cache hit rate < 70%
 *    - Database query time > 100ms
 * 7. Use health checks for:
 *    - Kubernetes liveness/readiness probes
 *    - Load balancer health checks
 *    - Monitoring systems
 */

export {
  logger,
  metricsCollector,
  checkServiceHealth,
  ExampleService
};

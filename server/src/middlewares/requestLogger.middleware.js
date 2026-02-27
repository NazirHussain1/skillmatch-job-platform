import logger from '../utils/logger.js';

// Middleware to log all requests
export const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    
    // Log response
    logger.info('Outgoing response', {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    // Update metrics
    if (global.metrics) {
      global.metrics.recordRequest(req.method, req.url, res.statusCode, duration);
    }

    originalSend.call(this, data);
  };

  next();
};

export default requestLoggerMiddleware;

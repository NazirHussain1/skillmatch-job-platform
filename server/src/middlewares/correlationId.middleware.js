import { generateCorrelationId } from '../utils/logger.js';

// Middleware to add correlation ID to each request
export const correlationIdMiddleware = (req, res, next) => {
  // Check if correlation ID exists in headers, otherwise generate new one
  const correlationId = req.headers['x-correlation-id'] || generateCorrelationId();
  
  // Attach to request object
  req.correlationId = correlationId;
  
  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

export default correlationIdMiddleware;

import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Custom format to mask sensitive data
const maskSensitiveData = winston.format((info) => {
  const sensitiveFields = ['password', 'token', 'refreshToken', 'authorization', 'cookie', 'secret'];
  
  const maskObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const masked = { ...obj };
    for (const key in masked) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        masked[key] = '***MASKED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskObject(masked[key]);
      }
    }
    return masked;
  };

  return maskObject(info);
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    maskSensitiveData(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'skillmatch-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          const corrId = correlationId ? `[${correlationId}]` : '';
          return `${timestamp} ${level} ${corrId}: ${message} ${metaStr}`;
        })
      )
    }),
    // Write errors to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Generate correlation ID
export const generateCorrelationId = () => uuidv4();

// Add correlation ID to logger
export const logWithCorrelation = (level, message, correlationId, meta = {}) => {
  logger.log(level, message, { correlationId, ...meta });
};

export default logger;

import app from './app.js';
import connectDB from './config/database.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';
import { initRedis, closeRedis, isRedisAvailable } from './config/redis.js';
import validateEnv from './config/env.validation.js';
import logger from './utils/logger.js';
import fs from 'fs';

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Validate environment variables before starting
const env = validateEnv();

// Connect to database
connectDB();

// Initialize Redis (optional, won't crash if unavailable)
initRedis();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  const startupMessage = `
    ╔═══════════════════════════════════════╗
    ║   🚀 Server running on port ${PORT}     ║
    ║   🌍 Environment: ${env.NODE_ENV.padEnd(11)}        ║
    ║   📡 API: http://localhost:${PORT}/api    ║
    ║   🔌 Socket.IO: Enabled                ║
    ║   🔒 Security: Enhanced                ║
    ║   💾 Redis: ${isRedisAvailable() ? 'Enabled' : 'Disabled'}                  ║
    ║   📊 Metrics: /health/metrics          ║
    ║   🏥 Health: /health/ready             ║
    ╚═══════════════════════════════════════╝
  `;
  
  console.log(startupMessage);
  
  logger.info('Server started successfully', {
    port: PORT,
    environment: env.NODE_ENV,
    redis: isRedisAvailable() ? 'enabled' : 'disabled'
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', {
    error: err.message,
    stack: err.stack
  });
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await closeRedis();
  server.close(() => {
    logger.info('Process terminated');
  });
});

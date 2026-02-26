import app from './app.js';
import connectDB from './config/database.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';
import { initRedis, closeRedis, isRedisAvailable } from './config/redis.js';
import validateEnv from './config/env.validation.js';

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
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   🚀 Server running on port ${PORT}     ║
    ║   🌍 Environment: ${env.NODE_ENV.padEnd(11)}        ║
    ║   📡 API: http://localhost:${PORT}/api    ║
    ║   🔌 Socket.IO: Enabled                ║
    ║   🔒 Security: Enhanced                ║
    ║   💾 Redis: ${isRedisAvailable() ? 'Enabled' : 'Disabled'}                  ║
    ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  await closeRedis();
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

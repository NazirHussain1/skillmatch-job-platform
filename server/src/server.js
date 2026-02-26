import app from './app.js';
import connectDB from './config/database.js';
import { createServer } from 'http';
import { initializeSocket } from './config/socket.js';

// Connect to database
connectDB();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   Server running on port ${PORT}        ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
    ║   API: http://localhost:${PORT}/api    ║
    ║   Socket.IO: Enabled                  ║
    ╚═══════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

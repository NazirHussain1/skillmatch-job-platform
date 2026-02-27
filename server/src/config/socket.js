import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';
import { getRedis, isRedisAvailable } from './redis.js';
import logger from '../utils/logger.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    },
    // Enable sticky sessions support
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });

  // Use Redis adapter for horizontal scaling if Redis is available
  if (isRedisAvailable()) {
    try {
      const redis = getRedis();
      const pubClient = redis.duplicate();
      const subClient = redis.duplicate();

      io.adapter(createAdapter(pubClient, subClient));
      
      logger.info('Socket.IO using Redis adapter for horizontal scaling');
    } catch (error) {
      logger.warn('Failed to initialize Redis adapter for Socket.IO', {
        error: error.message
      });
    }
  } else {
    logger.warn('Socket.IO running without Redis adapter (single instance mode)');
  }

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      
      logger.info('Socket.IO user authenticated', {
        userId: socket.userId,
        socketId: socket.id
      });
      
      next();
    } catch (error) {
      logger.error('Socket.IO authentication failed', {
        error: error.message,
        socketId: socket.id
      });
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Socket.IO user connected', {
      userId: socket.userId,
      socketId: socket.id
    });

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    socket.on('disconnect', () => {
      logger.info('Socket.IO user disconnected', {
        userId: socket.userId,
        socketId: socket.id
      });
    });

    socket.on('error', (error) => {
      logger.error('Socket.IO error', {
        userId: socket.userId,
        socketId: socket.id,
        error: error.message
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

// Get connected users count (works across all instances with Redis adapter)
export const getConnectedUsersCount = async () => {
  if (!io) return 0;
  
  try {
    const sockets = await io.fetchSockets();
    return sockets.length;
  } catch (error) {
    logger.error('Failed to get connected users count', { error: error.message });
    return 0;
  }
};

// Check if user is connected (works across all instances with Redis adapter)
export const isUserConnected = async (userId) => {
  if (!io) return false;
  
  try {
    const socketsInRoom = await io.in(`user:${userId}`).fetchSockets();
    return socketsInRoom.length > 0;
  } catch (error) {
    logger.error('Failed to check user connection status', { 
      userId, 
      error: error.message 
    });
    return false;
  }
};

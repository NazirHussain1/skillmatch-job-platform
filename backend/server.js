// Load environment variables from .env.local or .env
require('dotenv').config({ path: '.env.local' });
// Fallback to .env if .env.local doesn't exist
if (!process.env.MONGODB_URI) {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const adminRoutes = require('./routes/admin.routes');
const chatRoutes = require('./routes/chat.routes');
const companyRoutes = require('./routes/company.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');
const sanitizeInputs = require('./middleware/sanitize.middleware');

const parseOrigins = (value) =>
  (value || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const devOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const configuredOrigins = parseOrigins(process.env.CORS_ORIGIN);
const allowedOrigins = [
  ...new Set(
    process.env.NODE_ENV === 'production'
      ? configuredOrigins
      : [...devOrigins, ...configuredOrigins]
  )
];

const isAllowedOrigin = (origin) => !origin || allowedOrigins.includes(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Connect to database
connectDB();

// Middleware
app.disable('x-powered-by');

app.use(helmet());
app.use(cors(corsOptions));

// Only use morgan in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(sanitizeInputs);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  // User joins with their ID
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
  });
  
  // Join conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });
  
  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
  });
  
  // Send message
  socket.on('send-message', (data) => {
    const { conversationId, message } = data;
    // Broadcast to all users in the conversation room
    io.to(conversationId).emit('receive-message', message);
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('user-typing', { userId });
  });
  
  socket.on('stop-typing', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('user-stop-typing', { userId });
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT);

module.exports = app;

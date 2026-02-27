import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import security middleware
import {
  helmetConfig,
  corsOptions,
  mongoSanitizeConfig,
  xssConfig,
  hppConfig,
  generalLimiter,
  disablePoweredBy
} from './config/security.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import jobRoutes from './modules/jobs/job.routes.js';
import applicationRoutes from './modules/applications/application.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import uploadRoutes from './modules/uploads/upload.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import matchingRoutes from './modules/matching/matching.routes.js';
import healthRoutes from './routes/health.routes.js';

// Import middlewares
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import correlationIdMiddleware from './middlewares/correlationId.middleware.js';
import requestLoggerMiddleware from './middlewares/requestLogger.middleware.js';

// Import utilities
import metricsCollector from './utils/metrics.js';
import logger from './utils/logger.js';

// Load env vars
dotenv.config();

const app = express();

// Make metrics globally available
global.metrics = metricsCollector;

// Trust proxy (for production behind reverse proxy)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Security Middleware
app.use(helmetConfig);
app.use(disablePoweredBy);
app.use(cors(corsOptions));
app.use(mongoSanitizeConfig);
app.use(xssConfig);
app.use(hppConfig);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Correlation ID middleware (must be before logging)
app.use(correlationIdMiddleware);

// Request logging middleware
app.use(requestLoggerMiddleware);

// Rate limiting (apply to all routes)
app.use('/api/', generalLimiter);

// Health and metrics routes (no /api prefix for standard endpoints)
app.use('/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/matching', matchingRoutes);

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;

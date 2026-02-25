import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config/env.config.js';
import { errorConverter, errorHandler } from './middlewares/error.middleware.js';
import {
  securityHeaders,
  limiter,
  sanitizeData,
  preventParamPollution,
} from './middlewares/security.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import ApiError from './utils/ApiError.js';

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(limiter);

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization
app.use(sanitizeData);
app.use(preventParamPollution);

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Error handling
app.use(errorConverter);
app.use(errorHandler);

export default app;

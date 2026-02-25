import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = ApiError.badRequest('Invalid resource ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = ApiError.conflict(`${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = ApiError.badRequest('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json(
    ApiResponse.error(message, statusCode, error.errors)
  );

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }
};

/**
 * 404 Not Found Handler
 */
export const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

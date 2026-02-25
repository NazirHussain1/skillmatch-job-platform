import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Validation Middleware
 * Checks for validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    throw ApiError.badRequest('Validation failed', formattedErrors);
  }
  
  next();
};

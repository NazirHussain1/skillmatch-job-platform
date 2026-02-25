import User from '../modules/auth/user.model.js';
import catchAsync from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import * as tokenService from '../modules/auth/token.service.js';

// Protect routes - require authentication
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route');
  }

  // Verify token
  const decoded = tokenService.verifyAccessToken(token);

  // Check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated');
  }

  // Check if user is suspended
  if (user.isSuspended) {
    throw new ApiError(403, 'Your account has been suspended');
  }

  // Check if password was changed after token was issued
  if (user.lastPasswordChange) {
    const passwordChangedAt = parseInt(user.lastPasswordChange.getTime() / 1000, 10);
    if (decoded.iat < passwordChangedAt) {
      throw new ApiError(401, 'Password recently changed. Please login again.');
    }
  }

  // Grant access
  req.user = user;
  next();
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
};

// Check if email is verified
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email to access this resource');
  }
  next();
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = tokenService.verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive && !user.isSuspended) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, continue without user
    }
  }

  next();
});

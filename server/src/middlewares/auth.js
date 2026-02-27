import User from '../modules/users/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import tokenManager from '../utils/tokenManager.js';
import tokenBlacklist from '../utils/tokenBlacklist.js';
import logger from '../utils/logger.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  // Check if token is blacklisted
  const isBlacklisted = await tokenBlacklist.isBlacklisted(token);
  if (isBlacklisted) {
    logger.warn('Blacklisted token used', {
      correlationId: req.correlationId,
      tokenPrefix: token.substring(0, 10)
    });
    throw ApiError.unauthorized('Token has been revoked');
  }

  try {
    const decoded = tokenManager.verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw ApiError.unauthorized('Not authorized, user not found');
    }

    // Attach token to request for potential blacklisting on logout
    req.token = token;

    next();
  } catch (error) {
    throw ApiError.unauthorized(error.message || 'Not authorized, token failed');
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};


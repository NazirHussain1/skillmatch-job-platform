const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');

// @desc    Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (!req.user.isActive) {
      return ApiResponse.error(res, 'User account is deactivated', 403);
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Not authorized, token failed', 401);
  }
});

// @desc    Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };

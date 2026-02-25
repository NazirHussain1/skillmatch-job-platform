import jwt from 'jsonwebtoken';
import User from '../modules/users/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw ApiError.unauthorized('Not authorized, user not found');
    }

    next();
  } catch (error) {
    throw ApiError.unauthorized('Not authorized, token failed');
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

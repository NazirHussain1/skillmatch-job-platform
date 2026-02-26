import ApiError from '../utils/ApiError.js';

/**
 * Role-Based Access Control Middleware
 */

// Check if user has required role
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role: ${allowedRoles.join(' or ')}`
      );
    }

    next();
  };
};

// Check if user owns the resource
export const requireOwnership = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      // Admin can access everything
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Get owner ID from the resource
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        throw ApiError.notFound('Resource not found');
      }

      // Check ownership
      if (ownerId.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Permission matrix for different roles
export const PERMISSIONS = {
  ADMIN: {
    canViewAllUsers: true,
    canViewAllJobs: true,
    canViewAllApplications: true,
    canDeleteAnyResource: true,
    canViewAnalytics: true,
    canManageUsers: true
  },
  EMPLOYER: {
    canPostJobs: true,
    canViewOwnJobs: true,
    canViewJobApplications: true,
    canUpdateApplicationStatus: true,
    canViewEmployerAnalytics: true,
    canUploadLogo: true
  },
  JOB_SEEKER: {
    canApplyToJobs: true,
    canViewOwnApplications: true,
    canUploadResume: true,
    canViewJobRecommendations: true,
    canViewSkillGap: true
  }
};

// Check if user has specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const userPermissions = PERMISSIONS[req.user.role];

    if (!userPermissions || !userPermissions[permission]) {
      throw ApiError.forbidden('You do not have permission to perform this action');
    }

    next();
  };
};

// Combine role and ownership check
export const requireRoleOrOwnership = (allowedRoles, getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      // Check if user has required role
      if (allowedRoles.includes(req.user.role)) {
        return next();
      }

      // If not, check ownership
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        throw ApiError.notFound('Resource not found');
      }

      if (ownerId.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Access denied');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

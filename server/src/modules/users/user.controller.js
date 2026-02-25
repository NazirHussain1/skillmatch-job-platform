import userService from './user.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(user, 'Profile updated successfully')
  );
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const analytics = await userService.getAnalytics(req.user._id, req.user.role);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(analytics, 'Analytics retrieved successfully')
  );
});

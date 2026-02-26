import analyticsService from './analytics.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const getEmployerAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getEmployerAnalytics(req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(analytics, 'Employer analytics retrieved successfully')
  );
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getAdminAnalytics();

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(analytics, 'Admin analytics retrieved successfully')
  );
});

export const trackJobView = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  await analyticsService.trackJobView(jobId, req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, 'Job view tracked')
  );
});

import applicationService from './application.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const getApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getApplications(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(applications, 'Applications retrieved successfully')
  );
});

export const getEmployerApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.getEmployerApplications(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(applications, 'Employer applications retrieved successfully')
  );
});

export const createApplication = asyncHandler(async (req, res) => {
  const application = await applicationService.createApplication(req.body, req.user._id);
  
  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(application, 'Application submitted successfully')
  );
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.body.status,
    req.user._id
  );
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(application, 'Application status updated successfully')
  );
});

export const deleteApplication = asyncHandler(async (req, res) => {
  const result = await applicationService.deleteApplication(req.params.id, req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, result.message)
  );
});

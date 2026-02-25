import jobService from './job.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getJobs(req.query);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(jobs, 'Jobs retrieved successfully')
  );
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(job, 'Job retrieved successfully')
  );
});

export const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.body, req.user._id);
  
  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(job, 'Job created successfully')
  );
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.body, req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(job, 'Job updated successfully')
  );
});

export const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(req.params.id, req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, result.message)
  );
});

export const getEmployerJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.getEmployerJobs(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(jobs, 'Employer jobs retrieved successfully')
  );
});

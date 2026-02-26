import matchingService from './matching.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const getSkillGap = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const skillGap = await matchingService.getSkillGap(req.user._id, jobId);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(skillGap, 'Skill gap analysis completed')
  );
});

export const getJobRecommendations = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const recommendations = await matchingService.getJobRecommendations(
    req.user._id,
    parseInt(limit) || 10
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(recommendations, 'Job recommendations retrieved')
  );
});

export const getCandidateRecommendations = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { limit } = req.query;
  
  const recommendations = await matchingService.getCandidateRecommendations(
    jobId,
    parseInt(limit) || 20
  );

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(recommendations, 'Candidate recommendations retrieved')
  );
});

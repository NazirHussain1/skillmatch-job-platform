import searchService from './search.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const searchJobs = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const result = await searchService.searchJobs(req.query, userId);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Search completed successfully')
  );
});

export const getSearchHistory = asyncHandler(async (req, res) => {
  const history = await searchService.getSearchHistory(req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(history, 'Search history retrieved successfully')
  );
});

export const deleteSearchHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await searchService.deleteSearchHistory(req.user._id, id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Search history deleted successfully')
  );
});

export const clearSearchHistory = asyncHandler(async (req, res) => {
  const result = await searchService.deleteSearchHistory(req.user._id);

  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(result, 'Search history cleared successfully')
  );
});

import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const signup = asyncHandler(async (req, res) => {
  const user = await authService.signup(req.body);
  
  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(user, 'User registered successfully')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(user, 'Login successful')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(user, 'User retrieved successfully')
  );
});

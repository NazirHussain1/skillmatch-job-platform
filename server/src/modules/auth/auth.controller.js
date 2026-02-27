import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import tokenManager from '../../utils/tokenManager.js';
import { HTTP_STATUS } from '../../config/constants.js';

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body, req.correlationId);
  
  // Set refresh token in httpOnly cookie
  tokenManager.setRefreshTokenCookie(res, result.refreshToken);
  
  res.status(HTTP_STATUS.CREATED).json(
    ApiResponse.created(
      { user: result.user, token: result.accessToken },
      'User registered successfully'
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password, req.correlationId);
  
  // Set refresh token in httpOnly cookie
  tokenManager.setRefreshTokenCookie(res, result.refreshToken);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(
      { user: result.user, token: result.accessToken },
      'Login successful'
    )
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  
  if (!oldRefreshToken) {
    throw ApiError.unauthorized('Refresh token not found');
  }
  
  const result = await authService.refreshToken(oldRefreshToken, req.correlationId);
  
  // Set new refresh token in cookie
  tokenManager.setRefreshTokenCookie(res, result.refreshToken);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(
      { token: result.accessToken },
      'Token refreshed successfully'
    )
  );
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.token || req.headers.authorization?.split(' ')[1];
  
  await authService.logout(req.user._id, token, req.correlationId);
  
  // Clear refresh token cookie
  tokenManager.clearRefreshTokenCookie(res);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(null, 'Logged out successfully')
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success(user, 'User retrieved successfully')
  );
});

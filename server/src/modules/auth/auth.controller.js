import crypto from 'crypto';
import User from './user.model.js';
import catchAsync from '../../utils/catchAsync.js';
import ApiError from '../../utils/ApiError.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import * as tokenService from './token.service.js';
import * as emailService from '../../services/email.service.js';
import config from '../../config/env.config.js';

// Register user
export const register = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email }).select('+password');
  if (existingUser) {
   
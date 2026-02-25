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
    throw new ApiError(400, 'Email already registered');
  }

  // Create user
  const user = await User.create(req.body);

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken);
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Error sending verification email');
  }

  sendSuccess(res, 201, { userId: user._id }, 'Registration successful. Please check your email to verify your account.');
});

// Login user
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new ApiError(423, 'Account is locked due to too many failed login attempts. Please try again later.');
  }

  // Check if account is suspended
  if (user.isSuspended) {
    throw new ApiError(403, `Account is suspended. Reason: ${user.suspensionReason || 'Contact support'}`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in');
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    const code = user.generate2FACode();
    await user.save({ validateBeforeSave: false });
    
    await emailService.send2FACode(user.email, code);
    
    return sendSuccess(res, 200, { requiresTwoFactor: true, email: user.email }, 'Please enter the 2FA code sent to your email');
  }

  // Reset login attempts
  await user.resetLoginAttempts();

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const { accessToken, refreshToken } = await tokenService.generateTokenPair(user._id);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieExpire * 24 * 60 * 60 * 1000,
  });

  // Remove sensitive data
  user.password = undefined;

  sendSuccess(res, 200, { user, accessToken }, 'Login successful');
});

// Verify 2FA
export const verify2FA = catchAsync(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isValid = user.verify2FACode(code);
  
  if (!isValid) {
    throw new ApiError(401, 'Invalid or expired 2FA code');
  }

  // Clear 2FA code
  user.twoFactorCode = undefined;
  user.twoFactorExpire = undefined;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Reset login attempts
  await user.resetLoginAttempts();

  // Generate tokens
  const { accessToken, refreshToken } = await tokenService.generateTokenPair(user._id);

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieExpire * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, 200, { user, accessToken }, '2FA verification successful');
});

// Refresh tokens
export const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token not found');
  }

  // Verify refresh token
  const decoded = tokenService.verifyRefreshToken(refreshToken);

  // Find user and check if token exists
  const user = await User.findById(decoded.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
  
  if (!tokenExists) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  // Remove old refresh token
  await tokenService.removeRefreshToken(user._id, refreshToken);

  // Generate new token pair
  const tokens = await tokenService.generateTokenPair(user._id);

  // Set new refresh token in cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieExpire * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, 200, { accessToken: tokens.accessToken }, 'Tokens refreshed successfully');
});

// Logout
export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    const decoded = tokenService.verifyRefreshToken(refreshToken);
    await tokenService.removeRefreshToken(decoded.id, refreshToken);
  }

  res.clearCookie('refreshToken');
  sendSuccess(res, 200, null, 'Logout successful');
});

// Logout from all devices
export const logoutAll = catchAsync(async (req, res) => {
  await tokenService.removeAllRefreshTokens(req.user._id);
  res.clearCookie('refreshToken');
  sendSuccess(res, 200, null, 'Logged out from all devices');
});

// Verify email
export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  await emailService.sendWelcomeEmail(user.email, user.name);

  sendSuccess(res, 200, null, 'Email verified successfully');
});

// Resend verification email
export const resendVerificationEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  await emailService.sendVerificationEmail(user.email, verificationToken);

  sendSuccess(res, 200, null, 'Verification email sent');
});

// Forgot password
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists
    return sendSuccess(res, 200, null, 'If the email exists, a password reset link has been sent');
  }

  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken);
    sendSuccess(res, 200, null, 'Password reset email sent');
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, 'Error sending password reset email');
  }
});

// Reset password
export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Logout from all devices
  await tokenService.removeAllRefreshTokens(user._id);

  sendSuccess(res, 200, null, 'Password reset successful. Please login with your new password.');
});

// Change password
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  // Logout from all other devices
  await tokenService.removeAllRefreshTokens(user._id);

  sendSuccess(res, 200, null, 'Password changed successfully');
});

// Enable 2FA
export const enable2FA = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, null, 'Two-factor authentication enabled');
});

// Disable 2FA
export const disable2FA = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.twoFactorEnabled = false;
  user.twoFactorCode = undefined;
  user.twoFactorExpire = undefined;
  await user.save({ validateBeforeSave: false });

  sendSuccess(res, 200, null, 'Two-factor authentication disabled');
});

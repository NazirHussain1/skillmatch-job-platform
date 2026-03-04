const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User.model');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json(
      ApiResponse.error('User already exists with this email', 400)
    );
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'jobseeker'
  });

  if (user) {
    return res.status(201).json(
      ApiResponse.success('User registered successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      })
    );
  }

  return res.status(400).json(
    ApiResponse.error('Invalid user data', 400)
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json(
      ApiResponse.error('Invalid email or password', 401)
    );
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  
  if (!isPasswordMatch) {
    return res.status(401).json(
      ApiResponse.error('Invalid email or password', 401)
    );
  }

  return res.status(200).json(
    ApiResponse.success('Login successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  );
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  return res.status(200).json(
    ApiResponse.success('Profile retrieved successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
  );
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(
      ApiResponse.error('No user found with this email', 404)
    );
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4F46E5; color: white; padding: 12px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="color: #4F46E5; word-break: break-all;">${resetUrl}</p>
      <p><strong>This link will expire in 10 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">
        This is an automated email from SkillMatch. Please do not reply.
      </p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - SkillMatch',
      html
    });

    return res.status(200).json(
      ApiResponse.success('Password reset email sent', { email: user.email })
    );
  } catch (error) {
    console.error('Email error:', error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json(
      ApiResponse.error('Email could not be sent', 500)
    );
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json(
      ApiResponse.error('Invalid or expired reset token', 400)
    );
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return res.status(200).json(
    ApiResponse.success('Password reset successful', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    })
  );
});

module.exports = { register, login, getProfile, forgotPassword, resetPassword };

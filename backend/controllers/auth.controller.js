const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');
const User = require('../models/User.model');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return ApiResponse.error(res, 'User already exists with this email', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'jobseeker',
    companyName: role === 'employer' ? companyName : undefined
  });

  if (user) {
    return ApiResponse.success(
      res,
      'User registered successfully',
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      },
      201
    );
  }

  return ApiResponse.error(res, 'Invalid user data', 400);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  if (!user.isActive) {
    return ApiResponse.error(res, 'Your account has been deactivated', 403);
  }

  // Check password
  const isPasswordMatch = await user.matchPassword(password);
  
  if (!isPasswordMatch) {
    return ApiResponse.error(res, 'Invalid email or password', 401);
  }

  return ApiResponse.success(
    res,
    'Login successful',
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      companyName: user.companyName,
      avatar: user.avatar,
      token: generateToken(user._id)
    }
  );
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  return ApiResponse.success(
    res,
    'User retrieved successfully',
    user
  );
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  return ApiResponse.success(
    res,
    'Logout successful',
    null
  );
});

module.exports = { register, login, getMe, logout };

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');
const User = require('../models/User.model');

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

module.exports = { register, login, getProfile };

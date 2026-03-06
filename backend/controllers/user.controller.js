const User = require('../models/User.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  res.status(200).json(
    ApiResponse.success('Profile retrieved successfully', user)
  );
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  // Update allowed fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
  user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
  user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
  user.education = req.body.education !== undefined ? req.body.education : user.education;
  user.location = req.body.location !== undefined ? req.body.location : user.location;
  user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;
  
  // Update employer-specific fields
  if (user.role === 'employer') {
    user.companyName = req.body.companyName !== undefined ? req.body.companyName : user.companyName;
    user.companyWebsite = req.body.companyWebsite !== undefined ? req.body.companyWebsite : user.companyWebsite;
    user.companyDescription = req.body.companyDescription !== undefined ? req.body.companyDescription : user.companyDescription;
    user.companyLogo = req.body.companyLogo !== undefined ? req.body.companyLogo : user.companyLogo;
  }
  
  // Update password if provided
  if (req.body.password) {
    user.password = req.body.password;
  }
  
  const updatedUser = await user.save();
  
  // Remove password from response
  const userResponse = updatedUser.toObject();
  delete userResponse.password;

  res.status(200).json(
    ApiResponse.success('Profile updated successfully', userResponse)
  );
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select('-password')
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.status(200).json(
    ApiResponse.success('Users retrieved successfully', {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  );
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  res.status(200).json(
    ApiResponse.success('User retrieved successfully', user)
  );
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  // Update fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

  const updatedUser = await user.save();
  
  // Remove password from response
  const userResponse = updatedUser.toObject();
  delete userResponse.password;

  res.status(200).json(
    ApiResponse.success('User updated successfully', userResponse)
  );
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  await user.deleteOne();

  res.status(200).json(
    ApiResponse.success('User deleted successfully', { id: req.params.id })
  );
});

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(
      ApiResponse.error('Please upload an image file', 400)
    );
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  // Delete old image from cloudinary if exists
  if (user.profilePicture) {
    try {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`skillmatch/profiles/${publicId}`);
    } catch {
      // Silently handle old image deletion errors
    }
  }

  // Upload to cloudinary
  const uploadStream = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'skillmatch/profiles',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
  };

  try {
    const result = await uploadStream();
    
    // Update user profile picture
    user.profilePicture = result.secure_url;
    await user.save();

    res.status(200).json(
      ApiResponse.success('Profile picture uploaded successfully', {
        profilePicture: result.secure_url
      })
    );
  } catch {
    res.status(500).json(
      ApiResponse.error('Error uploading image to cloudinary', 500)
    );
  }
});

// @desc    Upload company logo
// @route   POST /api/users/profile/company-logo
// @access  Private (Employer only)
const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(
      ApiResponse.error('Please upload an image file', 400)
    );
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  if (user.role !== 'employer') {
    return res.status(403).json(
      ApiResponse.error('Only employers can upload company logos', 403)
    );
  }

  // Delete old logo from cloudinary if exists
  if (user.companyLogo) {
    try {
      const publicId = user.companyLogo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`skillmatch/company-logos/${publicId}`);
    } catch {
      // Silently handle old logo deletion errors
    }
  }

  // Upload to cloudinary
  const uploadStream = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'skillmatch/company-logos',
          transformation: [
            { width: 400, height: 400, crop: 'fit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
  };

  try {
    const result = await uploadStream();
    
    // Update company logo
    user.companyLogo = result.secure_url;
    await user.save();

    res.status(200).json(
      ApiResponse.success('Company logo uploaded successfully', {
        companyLogo: result.secure_url
      })
    );
  } catch {
    res.status(500).json(
      ApiResponse.error('Error uploading image to cloudinary', 500)
    );
  }
});

// @desc    Upload resume
// @route   POST /api/users/profile/resume
// @access  Private (Jobseeker only)
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(
      ApiResponse.error('Please upload a resume file', 400)
    );
  }

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  if (user.role !== 'jobseeker') {
    return res.status(403).json(
      ApiResponse.error('Only jobseekers can upload resumes', 403)
    );
  }

  // Delete old resume from cloudinary if exists
  if (user.resume) {
    try {
      const publicId = user.resume.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`skillmatch/resumes/${publicId}`, { resource_type: 'raw' });
    } catch {
      // Silently handle old resume deletion errors
    }
  }

  // Upload to cloudinary
  const uploadStream = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'skillmatch/resumes',
          resource_type: 'raw',
          format: req.file.originalname.split('.').pop()
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
  };

  try {
    const result = await uploadStream();
    
    // Update user resume
    user.resume = result.secure_url;
    await user.save();

    res.status(200).json(
      ApiResponse.success('Resume uploaded successfully', {
        resume: result.secure_url
      })
    );
  } catch {
    res.status(500).json(
      ApiResponse.error('Error uploading resume to cloudinary', 500)
    );
  }
});

// @desc    Save/Bookmark job
// @route   POST /api/users/saved-jobs/:jobId
// @access  Private (Jobseeker only)
const saveJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  if (user.role !== 'jobseeker') {
    return res.status(403).json(
      ApiResponse.error('Only jobseekers can save jobs', 403)
    );
  }

  const jobId = req.params.jobId;

  // Check if job is already saved
  if (user.savedJobs.includes(jobId)) {
    return res.status(400).json(
      ApiResponse.error('Job already saved', 400)
    );
  }

  user.savedJobs.push(jobId);
  await user.save();

  res.status(200).json(
    ApiResponse.success('Job saved successfully', { savedJobs: user.savedJobs })
  );
});

// @desc    Unsave/Remove bookmark from job
// @route   DELETE /api/users/saved-jobs/:jobId
// @access  Private (Jobseeker only)
const unsaveJob = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  if (user.role !== 'jobseeker') {
    return res.status(403).json(
      ApiResponse.error('Only jobseekers can unsave jobs', 403)
    );
  }

  const jobId = req.params.jobId;

  user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
  await user.save();

  res.status(200).json(
    ApiResponse.success('Job removed from saved', { savedJobs: user.savedJobs })
  );
});

// @desc    Get saved jobs
// @route   GET /api/users/saved-jobs
// @access  Private (Jobseeker only)
const getSavedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedJobs',
    populate: {
      path: 'employer',
      select: 'name email companyName'
    }
  });
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }

  if (user.role !== 'jobseeker') {
    return res.status(403).json(
      ApiResponse.error('Only jobseekers can view saved jobs', 403)
    );
  }

  res.status(200).json(
    ApiResponse.success('Saved jobs retrieved successfully', user.savedJobs)
  );
});

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  uploadCompanyLogo,
  uploadResume,
  saveJob,
  unsaveJob,
  getSavedJobs
};

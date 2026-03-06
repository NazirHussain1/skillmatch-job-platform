const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User.model');
const Job = require('../models/Job.model');
const Application = require('../models/Application.model');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  
  const filter = {};
  if (role) {
    filter.role = role;
  }
  
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  
  const total = await User.countDocuments(filter);
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip(skip);
  
  return res.status(200).json(
    ApiResponse.success('Users retrieved successfully', {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  );
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }
  
  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json(
      ApiResponse.error('You cannot delete your own account', 400)
    );
  }
  
  // Delete user's jobs if employer
  if (user.role === 'employer') {
    await Job.deleteMany({ employer: user._id });
  }
  
  // Delete user's applications if jobseeker
  if (user.role === 'jobseeker') {
    await Application.deleteMany({ applicant: user._id });
  }
  
  await user.deleteOne();
  
  return res.status(200).json(
    ApiResponse.success('User deleted successfully', { id: req.params.id })
  );
});

// @desc    Get all jobs (admin)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
const getAllJobs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (status) {
    if (!['active', 'closed', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json(
        ApiResponse.error('Invalid status', 400)
      );
    }
    filter.status = status;
  }
  
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  
  const total = await Job.countDocuments(filter);
  
  const jobs = await Job.find(filter)
    .populate('employer', 'name email companyName')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip(skip);
  
  return res.status(200).json(
    ApiResponse.success('Jobs retrieved successfully', {
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  );
});

// @desc    Delete job (admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private (Admin only)
const deleteJobAdmin = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  // Delete all applications for this job
  await Application.deleteMany({ job: job._id });
  
  await job.deleteOne();
  
  return res.status(200).json(
    ApiResponse.success('Job deleted successfully', { id: req.params.id })
  );
});

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getAnalytics = asyncHandler(async (req, res) => {
  // Total counts
  const totalUsers = await User.countDocuments();
  const totalEmployers = await User.countDocuments({ role: 'employer' });
  const totalJobseekers = await User.countDocuments({ role: 'jobseeker' });
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  
  // Application status breakdown
  const pendingApplications = await Application.countDocuments({ status: 'pending' });
  const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
  const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
  
  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const newUsersLast30Days = await User.countDocuments({ 
    createdAt: { $gte: thirtyDaysAgo } 
  });
  const newJobsLast30Days = await Job.countDocuments({ 
    createdAt: { $gte: thirtyDaysAgo } 
  });
  const newApplicationsLast30Days = await Application.countDocuments({ 
    createdAt: { $gte: thirtyDaysAgo } 
  });
  
  // Top employers by job count
  const topEmployers = await Job.aggregate([
    {
      $group: {
        _id: '$employer',
        jobCount: { $sum: 1 }
      }
    },
    {
      $sort: { jobCount: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employerInfo'
      }
    },
    {
      $unwind: '$employerInfo'
    },
    {
      $project: {
        _id: 1,
        jobCount: 1,
        name: '$employerInfo.name',
        email: '$employerInfo.email',
        companyName: '$employerInfo.companyName'
      }
    }
  ]);
  
  // Jobs by salary range
  const jobsBySalary = await Job.aggregate([
    {
      $bucket: {
        groupBy: '$salary',
        boundaries: [0, 30000, 50000, 70000, 100000, 150000, 1000000],
        default: 'Other',
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);
  
  return res.status(200).json(
    ApiResponse.success('Analytics retrieved successfully', {
      overview: {
        totalUsers,
        totalEmployers,
        totalJobseekers,
        totalJobs,
        totalApplications
      },
      applications: {
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications
      },
      recentActivity: {
        newUsersLast30Days,
        newJobsLast30Days,
        newApplicationsLast30Days
      },
      topEmployers,
      jobsBySalary
    })
  );
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!['admin', 'employer', 'jobseeker'].includes(role)) {
    return res.status(400).json(
      ApiResponse.error('Invalid role', 400)
    );
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json(
      ApiResponse.error('User not found', 404)
    );
  }
  
  // Prevent admin from changing their own role
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json(
      ApiResponse.error('You cannot change your own role', 400)
    );
  }
  
  user.role = role;
  await user.save();
  
  return res.status(200).json(
    ApiResponse.success('User role updated successfully', user)
  );
});

// @desc    Approve job
// @route   PUT /api/admin/jobs/:id/approve
// @access  Private (Admin only)
const approveJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  job.status = 'active';
  await job.save();
  
  return res.status(200).json(
    ApiResponse.success('Job approved successfully', job)
  );
});

// @desc    Reject job
// @route   PUT /api/admin/jobs/:id/reject
// @access  Private (Admin only)
const rejectJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  job.status = 'rejected';
  await job.save();
  
  return res.status(200).json(
    ApiResponse.success('Job rejected successfully', job)
  );
});

// @desc    Get jobs by status
// @route   GET /api/admin/jobs/status/:status
// @access  Private (Admin only)
const getJobsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  if (!['active', 'closed', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json(
      ApiResponse.error('Invalid status', 400)
    );
  }
  
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  
  const total = await Job.countDocuments({ status });
  
  const jobs = await Job.find({ status })
    .populate('employer', 'name email companyName')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip(skip);
  
  return res.status(200).json(
    ApiResponse.success('Jobs retrieved successfully', {
      jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  );
});

module.exports = {
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJobAdmin,
  getAnalytics,
  updateUserRole,
  approveJob,
  rejectJob,
  getJobsByStatus
};

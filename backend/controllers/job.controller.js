const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Job = require('../models/Job.model');
const Application = require('../models/Application.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const { search, location, type, experience, page = 1, limit = 10 } = req.query;
  
  let query = { isActive: true };
  
  // Search filter
  if (search) {
    query.$text = { $search: search };
  }
  
  // Location filter
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  
  // Type filter
  if (type) {
    query.type = type;
  }

  // Experience filter
  if (experience) {
    query.experience = experience;
  }
  
  // Pagination
  const skip = (page - 1) * limit;
  
  const jobs = await Job.find(query)
    .populate('employer', 'name companyName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await Job.countDocuments(query);
  
  return ApiResponse.success(
    res,
    'Jobs retrieved successfully',
    {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  );
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('employer', 'name companyName email avatar');
  
  if (!job) {
    return ApiResponse.error(res, 'Job not found', 404);
  }
  
  return ApiResponse.success(res, 'Job retrieved successfully', job);
});

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Employer/Admin only)
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    employer: req.user._id
  });
  
  return ApiResponse.success(
    res,
    'Job created successfully',
    job,
    201
  );
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer/Admin only)
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);
  
  if (!job) {
    return ApiResponse.error(res, 'Job not found', 404);
  }
  
  // Check ownership (unless admin)
  if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to update this job', 403);
  }
  
  job = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  return ApiResponse.success(res, 'Job updated successfully', job);
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer/Admin only)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return ApiResponse.error(res, 'Job not found', 404);
  }
  
  // Check ownership (unless admin)
  if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return ApiResponse.error(res, 'Not authorized to delete this job', 403);
  }
  
  // Delete all applications for this job
  await Application.deleteMany({ job: req.params.id });
  
  await job.deleteOne();
  
  return ApiResponse.success(res, 'Job deleted successfully', null);
});

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer/Admin only)
const getMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer: req.user._id })
    .sort({ createdAt: -1 });
  
  return ApiResponse.success(
    res,
    'Your jobs retrieved successfully',
    jobs
  );
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
};

const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Job = require('../models/Job.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const { keyword, location, salary, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  
  // Keyword search (searches in title, company, and description)
  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { company: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }
  
  // Location filter
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }
  
  // Salary filter (minimum salary)
  if (salary) {
    filter.salary = { $gte: parseInt(salary) };
  }
  
  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  // Get total count for pagination
  const total = await Job.countDocuments(filter);
  
  // Get jobs with filters
  const jobs = await Job.find(filter)
    .populate('employer', 'name email')
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

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('employer', 'name email');
  
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  return res.status(200).json(
    ApiResponse.success('Job retrieved successfully', job)
  );
});

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Employer only)
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    employer: req.user._id
  });
  
  return res.status(201).json(
    ApiResponse.success('Job created successfully', job)
  );
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);
  
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  // Check ownership
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to update this job', 403)
    );
  }
  
  job = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  return res.status(200).json(
    ApiResponse.success('Job updated successfully', job)
  );
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  // Check ownership
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to delete this job', 403)
    );
  }
  
  await job.deleteOne();
  
  return res.status(200).json(
    ApiResponse.success('Job deleted successfully', { id: req.params.id })
  );
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
};

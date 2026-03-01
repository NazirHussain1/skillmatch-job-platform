const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Job = require('../models/Job.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find()
    .populate('employer', 'name email')
    .sort({ createdAt: -1 });
  
  return res.status(200).json(
    ApiResponse.success('Jobs retrieved successfully', jobs)
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

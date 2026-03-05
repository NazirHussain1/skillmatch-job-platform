const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Job = require('../models/Job.model');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const { keyword, location, salary, page = 1, limit = 10, employer } = req.query;
  
  // Build filter object
  const filter = {};
  
  // Filter by employer if provided
  if (employer) {
    filter.employer = employer;
  }
  
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

// @desc    Update job status
// @route   PATCH /api/jobs/:id/status
// @access  Private (Employer only)
const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  if (!['active', 'closed', 'draft'].includes(status)) {
    return res.status(400).json(
      ApiResponse.error('Invalid status', 400)
    );
  }
  
  const job = await Job.findById(req.params.id);
  
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
  
  job.status = status;
  await job.save();
  
  return res.status(200).json(
    ApiResponse.success('Job status updated successfully', job)
  );
});

// @desc    Get job statistics for employer
// @route   GET /api/jobs/stats
// @access  Private (Employer only)
const getJobStats = asyncHandler(async (req, res) => {
  const Application = require('../models/Application.model');
  
  // Get all jobs for this employer
  const jobs = await Job.find({ employer: req.user._id });
  const jobIds = jobs.map(job => job._id);
  
  // Get application statistics
  const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
  const pendingApplications = await Application.countDocuments({ 
    job: { $in: jobIds },
    status: 'pending'
  });
  const acceptedApplications = await Application.countDocuments({ 
    job: { $in: jobIds },
    status: 'accepted'
  });
  const rejectedApplications = await Application.countDocuments({ 
    job: { $in: jobIds },
    status: 'rejected'
  });
  
  // Job statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const closedJobs = jobs.filter(job => job.status === 'closed').length;
  const draftJobs = jobs.filter(job => job.status === 'draft').length;
  
  // Recent applications (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentApplications = await Application.countDocuments({
    job: { $in: jobIds },
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  return res.status(200).json(
    ApiResponse.success('Job statistics retrieved successfully', {
      jobs: {
        total: totalJobs,
        active: activeJobs,
        closed: closedJobs,
        draft: draftJobs
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        recent: recentApplications
      }
    })
  );
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getJobStats
};

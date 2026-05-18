const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Job = require('../models/Job.model');

const normalizeList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || '').trim())
    .filter(Boolean);
};

const normalizeJobPayload = (payload) => {
  const normalizedPayload = {
    ...payload
  };

  if (payload.salaryMin !== undefined && payload.salaryMin !== '') {
    normalizedPayload.salaryMin = Number(payload.salaryMin);
  }

  if (payload.salaryMax !== undefined && payload.salaryMax !== '') {
    normalizedPayload.salaryMax = Number(payload.salaryMax);
  }

  if (payload.salary !== undefined && payload.salary !== '') {
    normalizedPayload.salary = Number(payload.salary);
  } else if (normalizedPayload.salaryMax !== undefined) {
    normalizedPayload.salary = normalizedPayload.salaryMax;
  } else if (normalizedPayload.salaryMin !== undefined) {
    normalizedPayload.salary = normalizedPayload.salaryMin;
  }

  if (payload.skills !== undefined) {
    normalizedPayload.skills = normalizeList(payload.skills);
  }

  if (payload.benefits !== undefined) {
    normalizedPayload.benefits = normalizeList(payload.benefits);
  }

  if (payload.applicationDeadline === '') {
    normalizedPayload.applicationDeadline = undefined;
  }

  if (payload.isUrgent !== undefined) {
    normalizedPayload.isUrgent = payload.isUrgent === true || payload.isUrgent === 'true';
  }

  return normalizedPayload;
};

const canManageEmployerJobs = (user, employerId) => {
  if (!user) {
    return false;
  }

  return user.role === 'admin' || (
    user.role === 'employer' &&
    employerId &&
    user._id.toString() === employerId.toString()
  );
};

const canViewPrivateJob = (user, job) => {
  if (job.status === 'active') {
    return true;
  }

  return canManageEmployerJobs(user, job.employer);
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const {
    keyword,
    location,
    salary,
    category,
    jobType,
    workplaceType,
    experienceLevel,
    skill,
    status,
    page = 1,
    limit = 10,
    employer
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  const canViewEmployerPrivateJobs = canManageEmployerJobs(req.user, employer);

  // Filter by employer if provided
  if (employer) {
    filter.employer = employer;
  }

  if (status) {
    if (!['active', 'closed', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json(
        ApiResponse.error('Invalid status', 400)
      );
    }
    if (status !== 'active' && !canViewEmployerPrivateJobs) {
      return res.status(403).json(
        ApiResponse.error('Not authorized to view jobs with this status', 403)
      );
    }

    filter.status = status;
  } else if (!employer) {
    // Public jobs listing only shows moderated/approved jobs.
    filter.status = 'active';
  } else if (!canViewEmployerPrivateJobs) {
    // Public company/employer listings must not expose pending, rejected, or closed jobs.
    filter.status = 'active';
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
  
  // Job Type filter
  if (jobType) {
    filter.jobType = jobType;
  }

  if (workplaceType) {
    filter.workplaceType = workplaceType;
  }

  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }

  if (skill) {
    filter.skills = { $regex: skill, $options: 'i' };
  }
  
  // Category filter
  if (category) {
    filter.category = category;
  }
  
  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  
  // Get total count for pagination
  const total = await Job.countDocuments(filter);
  
  // Get jobs with filters
  const jobs = await Job.find(filter)
    .populate('employer', 'name email')
    .populate('applicationCount')
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

  if (!canViewPrivateJob(req.user, job)) {
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
    ...normalizeJobPayload(req.body),
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
    normalizeJobPayload(req.body),
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
  
  if (!['closed', 'pending'].includes(status)) {
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
  const pendingJobs = jobs.filter(job => job.status === 'pending').length;
  
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
        pending: pendingJobs
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

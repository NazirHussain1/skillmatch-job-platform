const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Application = require('../models/Application.model');
const Job = require('../models/Job.model');

// @desc    Get all applications for a user
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  let query = {};
  
  // If jobseeker, get their applications
  if (req.user.role === 'jobseeker') {
    query.applicant = req.user._id;
  }
  // If employer, get applications for their jobs
  else if (req.user.role === 'employer') {
    const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
    const jobIds = employerJobs.map(job => job._id);
    query.job = { $in: jobIds };
  }
  
  const applications = await Application.find(query)
    .populate('job', 'title companyName location salary type')
    .populate('applicant', 'name email skills avatar')
    .sort({ createdAt: -1 });
  
  return ApiResponse.success(
    res,
    'Applications retrieved successfully',
    applications
  );
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job', 'title companyName location salary type employer')
    .populate('applicant', 'name email skills avatar bio');
  
  if (!application) {
    return ApiResponse.error(res, 'Application not found', 404);
  }
  
  // Check authorization
  const isApplicant = application.applicant._id.toString() === req.user._id.toString();
  const isEmployer = application.job.employer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!isApplicant && !isEmployer && !isAdmin) {
    return ApiResponse.error(res, 'Not authorized to view this application', 403);
  }
  
  return ApiResponse.success(
    res,
    'Application retrieved successfully',
    application
  );
});

// @desc    Create application
// @route   POST /api/applications
// @access  Private (Jobseeker only)
const createApplication = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, resume } = req.body;
  
  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return ApiResponse.error(res, 'Job not found', 404);
  }
  
  if (!job.isActive) {
    return ApiResponse.error(res, 'This job is no longer active', 400);
  }
  
  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user._id
  });
  
  if (existingApplication) {
    return ApiResponse.error(res, 'You have already applied to this job', 400);
  }
  
  const application = await Application.create({
    job: jobId,
    applicant: req.user._id,
    coverLetter,
    resume
  });
  
  const populatedApplication = await Application.findById(application._id)
    .populate('job', 'title companyName location salary type')
    .populate('applicant', 'name email skills avatar');
  
  return ApiResponse.success(
    res,
    'Application submitted successfully',
    populatedApplication,
    201
  );
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer/Admin only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  
  const application = await Application.findById(req.params.id)
    .populate('job');
  
  if (!application) {
    return ApiResponse.error(res, 'Application not found', 404);
  }
  
  // Check if user is the job owner or admin
  const isEmployer = application.job.employer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!isEmployer && !isAdmin) {
    return ApiResponse.error(res, 'Not authorized to update this application', 403);
  }
  
  application.status = status;
  if (notes) {
    application.notes = notes;
  }
  
  await application.save();
  
  return ApiResponse.success(
    res,
    'Application status updated successfully',
    application
  );
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  
  if (!application) {
    return ApiResponse.error(res, 'Application not found', 404);
  }
  
  // Check if user is the applicant or admin
  const isApplicant = application.applicant.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!isApplicant && !isAdmin) {
    return ApiResponse.error(res, 'Not authorized to delete this application', 403);
  }
  
  await application.deleteOne();
  
  return ApiResponse.success(res, 'Application deleted successfully', null);
});

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  deleteApplication
};

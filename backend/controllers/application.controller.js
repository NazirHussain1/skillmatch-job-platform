const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const Notification = require('../models/Notification.model');

// @desc    Create application
// @route   POST /api/applications/:jobId
// @access  Private (Jobseeker only)
const createApplication = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    applicant: req.user._id
  });
  
  if (existingApplication) {
    return res.status(400).json(
      ApiResponse.error('You have already applied to this job', 400)
    );
  }
  
  // Create application
  const application = await Application.create({
    job: jobId,
    applicant: req.user._id
  });

  if (job.employer.toString() !== req.user._id.toString()) {
    await Notification.create({
      userId: job.employer,
      type: 'application_received',
      message: `${req.user.name} applied to your job "${job.title}".`
    });
  }
  
  // Populate and return
  const populatedApplication = await Application.findById(application._id)
    .populate('job', 'title company location salary')
    .populate('applicant', 'name email resume');
  
  return res.status(201).json(
    ApiResponse.success('Application submitted successfully', populatedApplication)
  );
});

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location salary')
    .sort({ createdAt: -1 });
  
  return res.status(200).json(
    ApiResponse.success('Applications retrieved successfully', applications)
  );
});

// @desc    Get applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json(
      ApiResponse.error('Job not found', 404)
    );
  }
  
  // Check if user is the job owner
  if (job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to view applications for this job', 403)
    );
  }
  
  // Get applications
  const applications = await Application.find({ job: jobId })
    .populate('applicant', 'name email resume')
    .sort({ createdAt: -1 });
  
  return res.status(200).json(
    ApiResponse.success('Applications retrieved successfully', applications)
  );
});

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer only)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  // Find application and populate job
  const application = await Application.findById(req.params.id)
    .populate('job');
  
  if (!application) {
    return res.status(404).json(
      ApiResponse.error('Application not found', 404)
    );
  }
  
  // Check if user is the job owner
  if (application.job.employer.toString() !== req.user._id.toString()) {
    return res.status(403).json(
      ApiResponse.error('Not authorized to update this application', 403)
    );
  }
  
  const previousStatus = application.status;

  // Update status
  application.status = status;
  await application.save();

  if (status !== previousStatus) {
    if (status === 'accepted') {
      await Notification.create({
        userId: application.applicant,
        type: 'application_accepted',
        message: `Your application for "${application.job.title}" has been accepted.`
      });
    } else if (status === 'rejected') {
      await Notification.create({
        userId: application.applicant,
        type: 'application_rejected',
        message: `Your application for "${application.job.title}" has been rejected.`
      });
    }
  }
  
  // Return updated application with populated fields
  const updatedApplication = await Application.findById(application._id)
    .populate('job', 'title company location salary')
    .populate('applicant', 'name email resume');
  
  return res.status(200).json(
    ApiResponse.success('Application status updated successfully', updatedApplication)
  );
});

module.exports = {
  createApplication,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus
};

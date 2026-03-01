const Application = require('../models/Application.model');
const Job = require('../models/Job.model');

// @desc    Get all applications for a user
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title companyName location salary type')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create application
// @route   POST /api/applications
// @access  Private (Job Seeker only)
const createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }
    
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter
    });
    
    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title companyName location salary type');
    
    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('job');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is the job owner
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user is the applicant
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await application.deleteOne();
    res.json({ message: 'Application removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
};

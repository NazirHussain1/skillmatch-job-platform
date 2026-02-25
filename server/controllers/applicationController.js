import Application from '../models/Application.jsx';
import Job from '../models/Job.jsx';

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId', 'title companyName location salary type')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for employer's jobs
// @route   GET /api/applications/employer
// @access  Private (Employer only)
export const getEmployerApplications = async (req, res) => {
  try {
    // Get all jobs posted by this employer
    const jobs = await Job.find({ employerId: req.user._id });
    const jobIds = jobs.map(job => job._id);

    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('userId', 'name email avatar skills bio')
      .populate('jobId', 'title companyName location salary type')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Job Seeker only)
export const createApplication = async (req, res) => {
  try {
    const { jobId, jobTitle, companyName, matchScore } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await Application.create({
      jobId,
      userId: req.user._id,
      jobTitle,
      companyName,
      matchScore,
      status: 'Pending'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer only)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user is the employer who posted the job
    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns the application
    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this application' });
    }

    await application.deleteOne();

    res.json({ message: 'Application removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

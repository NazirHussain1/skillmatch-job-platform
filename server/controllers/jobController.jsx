import Job from '../models/Job.jsx';

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { search, location, type, skills } = req.query;
    let query = { isActive: true };

    // Text search
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

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',');
      query.requiredSkills = { $in: skillsArray };
    }

    const jobs = await Job.find(query)
      .populate('employerId', 'name email companyName')
      .sort({ postedAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'name email companyName');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employer only)
export const createJob = async (req, res) => {
  try {
    const { title, companyName, location, salary, type, description, requiredSkills } = req.body;

    const job = await Job.create({
      title,
      employerId: req.user._id,
      companyName,
      location,
      salary,
      type,
      description,
      requiredSkills
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer only)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job owner
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is the job owner
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer only)
export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.user._id })
      .sort({ postedAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

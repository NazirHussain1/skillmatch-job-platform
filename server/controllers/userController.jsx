import User from '../models/User.jsx';
import Application from '../models/Application.jsx';
import Job from '../models/Job.jsx';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.skills = req.body.skills !== undefined ? req.body.skills : user.skills;
    user.avatar = req.body.avatar || user.avatar;
    user.companyName = req.body.companyName || user.companyName;

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      skills: updatedUser.skills,
      bio: updatedUser.bio,
      companyName: updatedUser.companyName
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user analytics
// @route   GET /api/users/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    if (role === 'JOB_SEEKER') {
      const applications = await Application.find({ userId });
      
      const analytics = {
        profileViews: Math.floor(Math.random() * 100) + 20,
        applicationsSent: applications.length,
        interviewsScheduled: applications.filter(a => a.status === 'Interviewing').length,
        offersReceived: applications.filter(a => a.status === 'Accepted').length,
        skillMatchTrend: [
          { month: 'Jan', score: 65 },
          { month: 'Feb', score: 72 },
          { month: 'Mar', score: 78 },
          { month: 'Apr', score: 85 },
          { month: 'May', score: 88 },
        ]
      };

      res.json(analytics);
    } else if (role === 'EMPLOYER') {
      const jobs = await Job.find({ employerId: userId });
      const jobIds = jobs.map(job => job._id);
      const applications = await Application.find({ jobId: { $in: jobIds } });

      const analytics = {
        jobsPosted: jobs.length,
        applicationsReceived: applications.length,
        candidatesInterviewed: applications.filter(a => a.status === 'Interviewing').length,
        hiresMade: applications.filter(a => a.status === 'Accepted').length,
        applicationTrend: [
          { month: 'Jan', count: 12 },
          { month: 'Feb', count: 18 },
          { month: 'Mar', count: 25 },
          { month: 'Apr', count: 32 },
          { month: 'May', count: applications.length },
        ]
      };

      res.json(analytics);
    } else {
      res.status(400).json({ message: 'Invalid user role' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

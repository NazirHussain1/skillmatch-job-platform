import Job from '../jobs/job.model.js';
import Application from '../applications/application.model.js';
import User from '../users/user.model.js';

class AnalyticsService {
  async getEmployerAnalytics(employerId) {
    const jobs = await Job.find({ employerId });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } });

    // Calculate metrics per job
    const jobAnalytics = await Promise.all(jobs.map(async (job) => {
      const jobApplications = applications.filter(
        app => app.jobId.toString() === job._id.toString()
      );

      const conversionRate = job.views > 0 
        ? ((jobApplications.length / job.views) * 100).toFixed(2)
        : 0;

      return {
        jobId: job._id,
        title: job.title,
        views: job.views,
        applications: jobApplications.length,
        conversionRate: parseFloat(conversionRate),
        postedAt: job.postedAt
      };
    }));

    // Skill demand analysis
    const skillDemand = {};
    jobs.forEach(job => {
      job.requiredSkills.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillDemand)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: ((count / jobs.length) * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // Application trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationTrend = await Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          appliedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      summary: {
        totalJobs: jobs.length,
        totalApplications: applications.length,
        totalViews: jobs.reduce((sum, job) => sum + job.views, 0),
        avgConversionRate: jobAnalytics.length > 0
          ? (jobAnalytics.reduce((sum, j) => sum + j.conversionRate, 0) / jobAnalytics.length).toFixed(2)
          : 0
      },
      jobAnalytics,
      topSkills,
      applicationTrend
    };
  }

  async getAdminAnalytics() {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'JOB_SEEKER' });
    const totalEmployers = await User.countDocuments({ role: 'EMPLOYER' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Application activity (last 30 days)
    const applicationActivity = await Application.aggregate([
      {
        $match: {
          appliedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most active employers
    const activeEmployers = await Job.aggregate([
      {
        $group: {
          _id: '$employerId',
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employer'
        }
      },
      { $unwind: '$employer' },
      {
        $project: {
          name: '$employer.name',
          email: '$employer.email',
          companyName: '$employer.companyName',
          jobCount: 1
        }
      }
    ]);

    // Most popular jobs
    const popularJobs = await Application.aggregate([
      {
        $group: {
          _id: '$jobId',
          applicationCount: { $sum: 1 }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          title: '$job.title',
          companyName: '$job.companyName',
          applicationCount: 1
        }
      }
    ]);

    // Platform-wide skill demand
    const allJobs = await Job.find({ isActive: true });
    const skillDemand = {};
    
    allJobs.forEach(job => {
      job.requiredSkills.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillDemand)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: ((count / allJobs.length) * 100).toFixed(2)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return {
      summary: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        totalApplications
      },
      registrationTrend,
      applicationActivity,
      activeEmployers,
      popularJobs,
      topSkills
    };
  }

  async trackJobView(jobId, userId) {
    const job = await Job.findById(jobId);
    
    if (!job) {
      return null;
    }

    // Check if user already viewed this job
    const alreadyViewed = job.uniqueViewers.some(
      viewerId => viewerId.toString() === userId.toString()
    );

    if (!alreadyViewed) {
      job.uniqueViewers.push(userId);
      job.views += 1;
      await job.save();
    }

    return job;
  }
}

export default new AnalyticsService();

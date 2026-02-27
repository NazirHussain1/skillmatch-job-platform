import Job from '../jobs/job.model.js';
import Application from '../applications/application.model.js';
import User from '../users/user.model.js';
import cacheService from '../../utils/cacheService.js';

class AnalyticsService {
  async getEmployerAnalytics(employerId) {
    // Check cache first
    const cacheKey = `analytics:employer:${employerId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('🎯 Cache hit for employer analytics');
      return cached;
    }

    const jobs = await Job.find({ employerId }).lean();
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } }).lean();

    // Calculate metrics per job
    const jobAnalytics = jobs.map((job) => {
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
    });

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

    // Application trends (last 30 days) - optimized aggregation
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
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    const result = {
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

    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  async getAdminAnalytics() {
    // Check cache first
    const cacheKey = 'analytics:admin';
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log('🎯 Cache hit for admin analytics');
      return cached;
    }

    // Use countDocuments for better performance
    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      totalApplications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Application.countDocuments()
    ]);

    // Registration trends (last 30 days) - optimized
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
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    // Application activity (last 30 days) - optimized
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
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]);

    // Most active employers - optimized
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
          as: 'employer',
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                companyName: 1
              }
            }
          ]
        }
      },
      { $unwind: '$employer' },
      {
        $project: {
          _id: 0,
          name: '$employer.name',
          email: '$employer.email',
          companyName: '$employer.companyName',
          jobCount: 1
        }
      }
    ]);

    // Most popular jobs - optimized
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
          as: 'job',
          pipeline: [
            {
              $project: {
                title: 1,
                companyName: 1
              }
            }
          ]
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          _id: 0,
          title: '$job.title',
          companyName: '$job.companyName',
          applicationCount: 1
        }
      }
    ]);

    // Platform-wide skill demand - optimized
    const skillDemandAgg = await Job.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const totalActiveJobs = await Job.countDocuments({ isActive: true });
    const topSkills = skillDemandAgg.map(item => ({
      skill: item._id,
      count: item.count,
      percentage: ((item.count / totalActiveJobs) * 100).toFixed(2)
    }));

    const result = {
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

    // Cache for 10 minutes
    await cacheService.set(cacheKey, result, 600);

    return result;
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
      
      // Invalidate analytics cache
      const employerId = job.employerId.toString();
      await cacheService.del(`analytics:employer:${employerId}`);
      await cacheService.del('analytics:admin');
    }

    return job;
  }

  async invalidateAnalyticsCache(employerId = null) {
    if (employerId) {
      await cacheService.del(`analytics:employer:${employerId}`);
    }
    await cacheService.del('analytics:admin');
  }
}

export default new AnalyticsService();

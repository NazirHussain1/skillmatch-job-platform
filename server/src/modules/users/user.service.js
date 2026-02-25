import userRepository from './user.repository.js';
import { UserResponseDTO, UpdateProfileDTO } from './user.dto.js';
import ApiError from '../../utils/ApiError.js';

class UserService {
  async updateProfile(userId, data) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updateData = new UpdateProfileDTO(data);
    const updatedUser = await userRepository.updateProfile(userId, updateData);
    
    return new UserResponseDTO(updatedUser);
  }

  async getAnalytics(userId, role) {
    if (role === 'JOB_SEEKER') {
      return await this.getJobSeekerAnalytics(userId);
    } else if (role === 'EMPLOYER') {
      return await this.getEmployerAnalytics(userId);
    }
    
    throw ApiError.badRequest('Invalid user role');
  }

  async getJobSeekerAnalytics(userId) {
    // Import here to avoid circular dependency
    const Application = (await import('../applications/application.model.js')).default;
    
    const applications = await Application.find({ userId });
    
    return {
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
  }

  async getEmployerAnalytics(userId) {
    const Job = (await import('../jobs/job.model.js')).default;
    const Application = (await import('../applications/application.model.js')).default;
    
    const jobs = await Job.find({ employerId: userId });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } });

    return {
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
  }
}

export default new UserService();

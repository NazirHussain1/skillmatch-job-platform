import applicationRepository from './application.repository.js';
import jobRepository from '../jobs/job.repository.js';
import notificationService from '../notifications/notification.service.js';
import { ApplicationResponseDTO, CreateApplicationDTO } from './application.dto.js';
import { emitToUser } from '../../config/socket.js';
import ApiError from '../../utils/ApiError.js';

class ApplicationService {
  async getApplications(userId) {
    const applications = await applicationRepository.findByUser(userId);
    return applications.map(app => new ApplicationResponseDTO(app));
  }

  async getEmployerApplications(employerId) {
    const Job = (await import('../jobs/job.model.js')).default;
    const jobs = await Job.find({ employerId });
    const jobIds = jobs.map(job => job._id);

    const applications = await applicationRepository.findByJobs(jobIds);
    return applications.map(app => new ApplicationResponseDTO(app));
  }

  async createApplication(data, userId) {
    const job = await jobRepository.findById(data.jobId);
    
    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    const existingApplication = await applicationRepository.findByJobAndUser(
      data.jobId,
      userId
    );

    if (existingApplication) {
      throw ApiError.conflict('You have already applied to this job');
    }

    const applicationData = new CreateApplicationDTO(data, userId);
    const application = await applicationRepository.create(applicationData);

    // Send notification to employer
    await notificationService.createNotification({
      userId: job.employerId,
      type: 'application_submitted',
      title: 'New Application Received',
      message: `You received a new application for ${job.title}`,
      relatedEntityId: application._id,
      relatedEntityType: 'Application'
    });

    return new ApplicationResponseDTO(application);
  }

  async updateApplicationStatus(applicationId, status, userId) {
    const application = await applicationRepository.findByIdWithJob(applicationId);

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (application.jobId.employerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to update this application');
    }

    application.status = status;
    await application.save();

    // Send notification to job seeker
    const notificationTypes = {
      'Reviewing': 'application_reviewed',
      'Accepted': 'application_accepted',
      'Rejected': 'application_rejected'
    };

    if (notificationTypes[status]) {
      await notificationService.createNotification({
        userId: application.userId,
        type: notificationTypes[status],
        title: `Application ${status}`,
        message: `Your application for ${application.jobTitle} has been ${status.toLowerCase()}`,
        relatedEntityId: application._id,
        relatedEntityType: 'Application'
      });
    }

    return new ApplicationResponseDTO(application);
  }

  async deleteApplication(applicationId, userId) {
    const application = await applicationRepository.findById(applicationId);

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (application.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to delete this application');
    }

    await applicationRepository.delete(applicationId);
    
    return { message: 'Application removed successfully' };
  }
}

export default new ApplicationService();

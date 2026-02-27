import applicationRepository from './application.repository.js';
import jobRepository from '../jobs/job.repository.js';
import notificationService from '../notifications/notification.service.js';
import { ApplicationResponseDTO, CreateApplicationDTO } from './application.dto.js';
import { emitToUser } from '../../config/socket.js';
import ApiError from '../../utils/ApiError.js';
import mongoose from 'mongoose';
import logger from '../../utils/logger.js';

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

  async createApplication(data, userId, correlationId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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

      // Create application within transaction
      const applicationData = new CreateApplicationDTO(data, userId);
      const [application] = await applicationRepository.model.create([applicationData], { session });

      // Increment job application count within transaction
      await jobRepository.model.findByIdAndUpdate(
        data.jobId,
        { $inc: { applicationCount: 1 } },
        { session }
      );

      // Create notification within transaction
      await notificationService.createNotificationWithSession({
        userId: job.employerId,
        type: 'application_submitted',
        title: 'New Application Received',
        message: `You received a new application for ${job.title}`,
        relatedEntityId: application._id,
        relatedEntityType: 'Application'
      }, session);

      // Commit transaction
      await session.commitTransaction();

      logger.info('Application created successfully', {
        correlationId,
        applicationId: application._id,
        userId,
        jobId: data.jobId
      });

      // Invalidate search cache (outside transaction)
      const cacheService = (await import('../../utils/cacheService.js')).default;
      await cacheService.delPattern('search:*');

      return new ApplicationResponseDTO(application);
    } catch (error) {
      await session.abortTransaction();
      
      logger.error('Application creation failed', {
        correlationId,
        userId,
        jobId: data.jobId,
        error: error.message
      });

      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateApplicationStatus(applicationId, status, userId, correlationId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const application = await applicationRepository.findByIdWithJob(applicationId);

      if (!application) {
        throw ApiError.notFound('Application not found');
      }

      if (application.jobId.employerId.toString() !== userId.toString()) {
        throw ApiError.forbidden('Not authorized to update this application');
      }

      // Store previous status for validation
      application._original = { status: application.status };
      application.status = status;
      
      await application.save({ session });

      // Send notification within transaction
      const notificationTypes = {
        'Reviewing': 'application_reviewed',
        'Accepted': 'application_accepted',
        'Rejected': 'application_rejected'
      };

      if (notificationTypes[status]) {
        await notificationService.createNotificationWithSession({
          userId: application.userId,
          type: notificationTypes[status],
          title: `Application ${status}`,
          message: `Your application for ${application.jobTitle} has been ${status.toLowerCase()}`,
          relatedEntityId: application._id,
          relatedEntityType: 'Application'
        }, session);
      }

      await session.commitTransaction();

      logger.info('Application status updated', {
        correlationId,
        applicationId,
        status,
        userId
      });

      return new ApplicationResponseDTO(application);
    } catch (error) {
      await session.abortTransaction();
      
      logger.error('Application status update failed', {
        correlationId,
        applicationId,
        status,
        error: error.message
      });

      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteApplication(applicationId, userId, correlationId) {
    const application = await applicationRepository.findById(applicationId);

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    if (application.userId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to delete this application');
    }

    // Soft delete
    await application.softDelete();

    logger.info('Application soft deleted', {
      correlationId,
      applicationId,
      userId
    });
    
    return { message: 'Application removed successfully' };
  }
}

export default new ApplicationService();

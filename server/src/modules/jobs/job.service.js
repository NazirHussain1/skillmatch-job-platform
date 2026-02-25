import jobRepository from './job.repository.js';
import { JobResponseDTO, CreateJobDTO, UpdateJobDTO } from './job.dto.js';
import ApiError from '../../utils/ApiError.js';

class JobService {
  async getJobs(filters) {
    const jobs = await jobRepository.findWithFilters(filters);
    return jobs.map(job => new JobResponseDTO(job));
  }

  async getJobById(jobId) {
    const job = await jobRepository.findByIdWithEmployer(jobId);
    
    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    return new JobResponseDTO(job);
  }

  async createJob(data, employerId) {
    const jobData = new CreateJobDTO(data, employerId);
    const job = await jobRepository.create(jobData);
    
    return new JobResponseDTO(job);
  }

  async updateJob(jobId, data, userId) {
    const job = await jobRepository.findById(jobId);

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (job.employerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to update this job');
    }

    const updateData = new UpdateJobDTO(data);
    const updatedJob = await jobRepository.update(jobId, updateData);

    return new JobResponseDTO(updatedJob);
  }

  async deleteJob(jobId, userId) {
    const job = await jobRepository.findById(jobId);

    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (job.employerId.toString() !== userId.toString()) {
      throw ApiError.forbidden('Not authorized to delete this job');
    }

    await jobRepository.delete(jobId);
    
    return { message: 'Job removed successfully' };
  }

  async getEmployerJobs(employerId) {
    const jobs = await jobRepository.findByEmployer(employerId);
    return jobs.map(job => new JobResponseDTO(job));
  }
}

export default new JobService();

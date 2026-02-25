import BaseRepository from '../../repositories/base.repository.js';
import Application from './application.model.js';

class ApplicationRepository extends BaseRepository {
  constructor() {
    super(Application);
  }

  async findByUser(userId) {
    return await this.findAll(
      { userId },
      {
        populate: 'jobId',
        sort: { appliedAt: -1 }
      }
    );
  }

  async findByJobs(jobIds) {
    return await this.findAll(
      { jobId: { $in: jobIds } },
      {
        populate: [
          { path: 'userId', select: 'name email avatar skills bio' },
          { path: 'jobId', select: 'title companyName location salary type' }
        ],
        sort: { appliedAt: -1 }
      }
    );
  }

  async findByJobAndUser(jobId, userId) {
    return await this.findOne({ jobId, userId });
  }

  async findByIdWithJob(applicationId) {
    return await this.model
      .findById(applicationId)
      .populate('jobId');
  }
}

export default new ApplicationRepository();

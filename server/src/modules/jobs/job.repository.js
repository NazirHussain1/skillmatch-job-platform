import BaseRepository from '../../repositories/base.repository.js';
import Job from './job.model.js';

class JobRepository extends BaseRepository {
  constructor() {
    super(Job);
  }

  async findWithFilters(filters) {
    const { search, location, type, skills } = filters;
    let query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray };
    }

    return await this.findAll(query, {
      populate: 'employerId',
      sort: { postedAt: -1 }
    });
  }

  async findByEmployer(employerId) {
    return await this.findAll(
      { employerId },
      { sort: { postedAt: -1 } }
    );
  }

  async findByIdWithEmployer(jobId) {
    return await this.model
      .findById(jobId)
      .populate('employerId', 'name email companyName');
  }
}

export default new JobRepository();

import Job from '../jobs/job.model.js';
import SearchHistory from './search.model.js';

class SearchService {
  async searchJobs(filters, userId = null) {
    const {
      search,
      location,
      type,
      skills,
      salaryMin,
      salaryMax,
      experienceLevel,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = filters;

    let query = { isActive: true };
    let sort = {};

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Job type filter
    if (type) {
      query.type = type;
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
      query.requiredSkills = { $in: skillsArray };
    }

    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      query.salaryRange = {};
      if (salaryMin) query.salaryRange.$gte = parseInt(salaryMin);
      if (salaryMax) query.salaryRange.$lte = parseInt(salaryMax);
    }

    // Sorting
    if (sortBy === 'relevance' && search) {
      sort = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'date') {
      sort = { postedAt: -1 };
    } else if (sortBy === 'salary') {
      sort = { salaryRange: -1 };
    } else {
      sort = { postedAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const jobs = await Job.find(query)
      .select(search ? { score: { $meta: 'textScore' } } : {})
      .populate('employerId', 'name email companyName companyLogo')
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Job.countDocuments(query);

    // Save search history
    if (userId && search) {
      await this.saveSearchHistory(userId, {
        query: search,
        filters: { location, type, skills, salaryMin, salaryMax, experienceLevel },
        resultCount: total
      });
    }

    return {
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async saveSearchHistory(userId, searchData) {
    // Keep only last 10 searches
    const count = await SearchHistory.countDocuments({ userId });
    
    if (count >= 10) {
      const oldestSearch = await SearchHistory.findOne({ userId })
        .sort({ searchedAt: 1 });
      
      if (oldestSearch) {
        await SearchHistory.findByIdAndDelete(oldestSearch._id);
      }
    }

    await SearchHistory.create({
      userId,
      ...searchData
    });
  }

  async getSearchHistory(userId, limit = 10) {
    return await SearchHistory.find({ userId })
      .sort({ searchedAt: -1 })
      .limit(limit);
  }

  async deleteSearchHistory(userId, searchId = null) {
    if (searchId) {
      await SearchHistory.findOneAndDelete({ _id: searchId, userId });
    } else {
      await SearchHistory.deleteMany({ userId });
    }

    return { success: true };
  }
}

export default new SearchService();

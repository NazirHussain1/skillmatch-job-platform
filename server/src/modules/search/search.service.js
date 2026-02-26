import Job from '../jobs/job.model.js';
import SearchHistory from './search.model.js';
import cacheService from '../../utils/cacheService.js';

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
      cursor,
      limit = 20
    } = filters;

    // Generate cache key
    const cacheKey = cacheService.generateCacheKey('search', {
      search,
      location,
      type,
      skills,
      salaryMin,
      salaryMax,
      experienceLevel,
      sortBy,
      cursor,
      limit
    });

    // Check cache
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit for search query');
      return cachedResult;
    }

    let query = { isActive: true };
    let sort = {};
    let projection = {
      title: 1,
      companyName: 1,
      location: 1,
      salary: 1,
      type: 1,
      requiredSkills: 1,
      postedAt: 1,
      views: 1,
      applicationCount: 1,
      employerId: 1
    };

    // Full-text search with weighted indexes
    if (search) {
      query.$text = { $search: search };
      projection.score = { $meta: 'textScore' };
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

    // Cursor-based pagination
    if (cursor) {
      query._id = { $lt: cursor };
    }

    // Sorting with relevance boosting
    if (sortBy === 'relevance' && search) {
      // Relevance with popularity and freshness boosting
      const jobs = await this.searchWithRelevanceBoost(query, projection, limit);
      
      const result = {
        jobs,
        pagination: {
          hasMore: jobs.length === limit,
          nextCursor: jobs.length > 0 ? jobs[jobs.length - 1]._id : null,
          limit: parseInt(limit)
        }
      };

      // Save search history
      if (userId && search) {
        await this.saveSearchHistory(userId, {
          query: search,
          filters: { location, type, skills, salaryMin, salaryMax, experienceLevel },
          resultCount: jobs.length
        });
      }

      // Cache result for 5 minutes
      await cacheService.set(cacheKey, result, 300);

      return result;
    } else if (sortBy === 'date') {
      sort = { postedAt: -1, _id: -1 };
    } else if (sortBy === 'salary') {
      sort = { salaryRange: -1, _id: -1 };
    } else if (sortBy === 'popularity') {
      sort = { applicationCount: -1, views: -1, _id: -1 };
    } else {
      sort = { postedAt: -1, _id: -1 };
    }

    // Execute query with projection
    const jobs = await Job.find(query)
      .select(projection)
      .populate('employerId', 'name email companyName companyLogo')
      .sort(sort)
      .limit(parseInt(limit));

    const result = {
      jobs,
      pagination: {
        hasMore: jobs.length === limit,
        nextCursor: jobs.length > 0 ? jobs[jobs.length - 1]._id : null,
        limit: parseInt(limit)
      }
    };

    // Save search history
    if (userId && search) {
      await this.saveSearchHistory(userId, {
        query: search,
        filters: { location, type, skills, salaryMin, salaryMax, experienceLevel },
        resultCount: jobs.length
      });
    }

    // Cache result for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  async searchWithRelevanceBoost(query, projection, limit) {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    const jobs = await Job.aggregate([
      { $match: query },
      {
        $addFields: {
          // Text relevance score
          textScore: { $meta: 'textScore' },
          
          // Popularity boost (0-1 scale, max at 100 applications)
          popularityBoost: {
            $min: [{ $divide: ['$applicationCount', 100] }, 1]
          },
          
          // Freshness boost (0-0.2 scale for jobs posted in last 30 days)
          freshnessBoost: {
            $cond: {
              if: { $gte: ['$postedAt', new Date(thirtyDaysAgo)] },
              then: {
                $multiply: [
                  0.2,
                  {
                    $divide: [
                      { $subtract: ['$postedAt', new Date(thirtyDaysAgo)] },
                      30 * 24 * 60 * 60 * 1000
                    ]
                  }
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $addFields: {
          // Final relevance score: textScore + (popularityBoost * 2) + freshnessBoost
          finalScore: {
            $add: [
              '$textScore',
              { $multiply: ['$popularityBoost', 2] },
              '$freshnessBoost'
            ]
          }
        }
      },
      { $sort: { finalScore: -1, _id: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          ...projection,
          score: '$textScore',
          finalScore: 1
        }
      }
    ]);

    // Populate employerId
    await Job.populate(jobs, {
      path: 'employerId',
      select: 'name email companyName companyLogo'
    });

    return jobs;
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

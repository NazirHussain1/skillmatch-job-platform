/**
 * Base Repository
 * Provides common database operations
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, select = '') {
    return await this.model.findById(id).select(select);
  }

  async findOne(filter, select = '') {
    return await this.model.findOne(filter).select(select);
  }

  async findAll(filter = {}, options = {}) {
    const { sort = {}, limit, skip, select = '', populate = '' } = options;
    
    let query = this.model.find(filter);
    
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    if (Object.keys(sort).length) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    
    return await query;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return await this.model.countDocuments(filter);
  }

  async exists(filter) {
    return await this.model.exists(filter);
  }
}

export default BaseRepository;

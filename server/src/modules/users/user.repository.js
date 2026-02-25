import BaseRepository from '../../repositories/base.repository.js';
import User from './user.model.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async findByEmailWithPassword(email) {
    return await this.model.findOne({ email }).select('+password');
  }

  async updateProfile(userId, data) {
    return await this.update(userId, data);
  }
}

export default new UserRepository();

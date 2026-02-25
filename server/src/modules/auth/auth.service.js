import jwt from 'jsonwebtoken';
import userRepository from '../users/user.repository.js';
import { UserWithTokenDTO, UserResponseDTO } from '../users/user.dto.js';
import ApiError from '../../utils/ApiError.js';

class AuthService {
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  }

  async signup(data) {
    const { name, email, password, role, companyName } = data;

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict('User already exists');
    }

    const user = await userRepository.create({
      name,
      email,
      password,
      role,
      companyName
    });

    const token = this.generateToken(user._id);
    return new UserWithTokenDTO(user, token);
  }

  async login(email, password) {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user || !(await user.matchPassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user._id);
    
    // Remove password from response
    user.password = undefined;
    
    return new UserWithTokenDTO(user, token);
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return new UserResponseDTO(user);
  }
}

export default new AuthService();

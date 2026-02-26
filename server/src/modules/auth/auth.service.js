import userRepository from '../users/user.repository.js';
import { UserWithTokenDTO, UserResponseDTO } from '../users/user.dto.js';
import ApiError from '../../utils/ApiError.js';
import tokenManager from '../../utils/tokenManager.js';

class AuthService {
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

    const { accessToken, refreshToken } = tokenManager.generateTokenPair(user._id);
    
    return {
      user: new UserResponseDTO(user),
      accessToken,
      refreshToken
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user || !(await user.matchPassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const { accessToken, refreshToken } = tokenManager.generateTokenPair(user._id);
    
    // Remove password from response
    user.password = undefined;
    
    return {
      user: new UserResponseDTO(user),
      accessToken,
      refreshToken
    };
  }

  async refreshToken(oldRefreshToken) {
    try {
      const decoded = tokenManager.verifyRefreshToken(oldRefreshToken);
      
      // Generate new token pair
      const { accessToken, refreshToken } = tokenManager.generateTokenPair(decoded.id);
      
      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId, accessToken) {
    // Blacklist the access token
    tokenManager.blacklistToken(accessToken);
    
    // Invalidate refresh tokens
    tokenManager.invalidateUserTokens(userId);
    
    return { message: 'Logged out successfully' };
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

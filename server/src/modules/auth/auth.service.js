import userRepository from '../users/user.repository.js';
import { UserWithTokenDTO, UserResponseDTO } from '../users/user.dto.js';
import ApiError from '../../utils/ApiError.js';
import tokenManager from '../../utils/tokenManager.js';
import tokenBlacklist from '../../utils/tokenBlacklist.js';
import logger from '../../utils/logger.js';

class AuthService {
  async signup(data, correlationId) {
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
    
    logger.info('User signed up successfully', {
      correlationId,
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    return {
      user: new UserResponseDTO(user),
      accessToken,
      refreshToken
    };
  }

  async login(email, password, correlationId) {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user || !(await user.matchPassword(password))) {
      logger.warn('Failed login attempt', {
        correlationId,
        email
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    const { accessToken, refreshToken } = tokenManager.generateTokenPair(user._id);
    
    // Remove password from response
    user.password = undefined;
    
    logger.info('User logged in successfully', {
      correlationId,
      userId: user._id,
      email: user.email
    });
    
    return {
      user: new UserResponseDTO(user),
      accessToken,
      refreshToken
    };
  }

  async refreshToken(oldRefreshToken, correlationId) {
    try {
      const decoded = tokenManager.verifyRefreshToken(oldRefreshToken);
      
      // Generate new token pair
      const { accessToken, refreshToken } = tokenManager.generateTokenPair(decoded.id);
      
      logger.info('Token refreshed successfully', {
        correlationId,
        userId: decoded.id
      });
      
      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.warn('Token refresh failed', {
        correlationId,
        error: error.message
      });
      throw ApiError.unauthorized('Invalid refresh token');
    }
  }

  async logout(userId, accessToken, correlationId) {
    // Blacklist the access token (15 minutes TTL)
    await tokenBlacklist.add(accessToken, 900);
    
    // Invalidate refresh tokens
    tokenManager.invalidateUserTokens(userId);
    
    logger.info('User logged out successfully', {
      correlationId,
      userId
    });
    
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

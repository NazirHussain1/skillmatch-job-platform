import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Store for token blacklist (in production, use Redis)
const tokenBlacklist = new Set();
const refreshTokenStore = new Map(); // userId -> refreshToken

class TokenManager {
  // Generate access token (short-lived)
  generateAccessToken(userId) {
    return jwt.sign(
      { id: userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(userId) {
    const refreshToken = jwt.sign(
      { id: userId, type: 'refresh', jti: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    // Store refresh token
    refreshTokenStore.set(userId.toString(), refreshToken);
    
    return refreshToken;
  }

  // Generate both tokens
  generateTokenPair(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId)
    };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      // Check if token is blacklisted
      if (tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token matches stored one
      const storedToken = refreshTokenStore.get(decoded.id.toString());
      if (storedToken !== token) {
        throw new Error('Refresh token has been rotated or revoked');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Rotate refresh token (generate new one, invalidate old)
  rotateRefreshToken(userId, oldRefreshToken) {
    try {
      // Verify old token first
      this.verifyRefreshToken(oldRefreshToken);
      
      // Generate new refresh token
      const newRefreshToken = this.generateRefreshToken(userId);
      
      return newRefreshToken;
    } catch (error) {
      throw new Error('Cannot rotate invalid refresh token');
    }
  }

  // Blacklist access token (for logout)
  blacklistToken(token) {
    tokenBlacklist.add(token);
    
    // Auto-remove from blacklist after expiry (15 minutes + buffer)
    setTimeout(() => {
      tokenBlacklist.delete(token);
    }, 16 * 60 * 1000);
  }

  // Invalidate all tokens for a user (logout from all devices)
  invalidateUserTokens(userId) {
    refreshTokenStore.delete(userId.toString());
  }

  // Set refresh token cookie
  setRefreshTokenCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth/refresh'
    });
  }

  // Clear refresh token cookie
  clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh'
    });
  }
}

export default new TokenManager();

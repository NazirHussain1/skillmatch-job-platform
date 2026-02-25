import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../../config/env.config.js';
import User from './user.model.js';

// Generate access token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpirationMinutes,
  });
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpirationDays,
  });
};

// Generate email verification token
export const generateEmailToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.emailSecret, {
    expiresIn: config.jwt.emailExpirationMinutes,
  });
};

// Verify access token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Verify email token
export const verifyEmailToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.emailSecret);
  } catch (error) {
    throw new Error('Invalid or expired email verification token');
  }
};

// Save refresh token to database
export const saveRefreshToken = async (userId, refreshToken) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await User.findByIdAndUpdate(userId, {
    $push: {
      refreshTokens: {
        token: refreshToken,
        expiresAt,
      },
    },
  });
};

// Remove refresh token from database
export const removeRefreshToken = async (userId, refreshToken) => {
  await User.findByIdAndUpdate(userId, {
    $pull: {
      refreshTokens: { token: refreshToken },
    },
  });
};

// Remove all refresh tokens (logout from all devices)
export const removeAllRefreshTokens = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $set: { refreshTokens: [] },
  });
};

// Clean expired refresh tokens
export const cleanExpiredTokens = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $pull: {
      refreshTokens: { expiresAt: { $lt: new Date() } },
    },
  });
};

// Generate token pair
export const generateTokenPair = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  
  await saveRefreshToken(userId, refreshToken);
  await cleanExpiredTokens(userId);
  
  return { accessToken, refreshToken };
};

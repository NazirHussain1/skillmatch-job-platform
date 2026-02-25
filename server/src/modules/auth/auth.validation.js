import Joi from 'joi';

const password = Joi.string()
  .min(8)
  .required()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'string.min': 'Password must be at least 8 characters long',
  });

export const register = {
  body: Joi.object().keys({
    name: Joi.string().required().trim().max(50),
    email: Joi.string().required().email().lowercase().trim(),
    password,
    role: Joi.string().valid('candidate', 'employer').default('candidate'),
    phone: Joi.string().trim().allow(''),
    location: Joi.string().trim().allow(''),
    companyName: Joi.string().when('role', {
      is: 'employer',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),
};

export const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

export const verify2FA = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    code: Joi.string().required().length(6).pattern(/^\d+$/),
  }),
};

export const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

export const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password,
  }),
};

export const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: password,
  }),
};

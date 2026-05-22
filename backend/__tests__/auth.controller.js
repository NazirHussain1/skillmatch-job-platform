jest.mock('../models/User.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../utils/generateToken', () => jest.fn(() => 'signed-test-token'));
jest.mock('../utils/sendEmail', () => jest.fn());

const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} = require('../controllers/auth.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('auth controller', () => {
  const originalFrontendUrl = process.env.FRONTEND_URL;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'https://skillmatch.example.com';
  });

  afterAll(() => {
    process.env.FRONTEND_URL = originalFrontendUrl;
  });

  describe('register', () => {
    it('rejects public admin registration', async () => {
      const req = {
        body: {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'StrongPass1!',
          role: 'admin'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      register(req, res, next);
      await flushPromises();

      expect(User.findOne).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Admin accounts cannot be created from public registration'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects duplicate email registration', async () => {
      User.findOne.mockResolvedValue({ _id: 'existing-user' });

      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongPass1!',
          role: 'jobseeker'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      register(req, res, next);
      await flushPromises();

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists with this email'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('creates a jobseeker by default and returns a token', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'jobseeker',
        isEmailVerified: true
      });

      const req = {
        body: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'StrongPass1!'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      register(req, res, next);
      await flushPromises();

      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'StrongPass1!',
        role: 'jobseeker',
        isEmailVerified: true
      });
      expect(generateToken).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful. You can now login.',
        data: {
          _id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'jobseeker',
          isEmailVerified: true,
          token: 'signed-test-token'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('rejects unknown users without revealing account existence details', async () => {
      const select = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select });

      const req = {
        body: {
          email: 'missing@example.com',
          password: 'WrongPass1!'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      login(req, res, next);
      await flushPromises();

      expect(User.findOne).toHaveBeenCalledWith({ email: 'missing@example.com' });
      expect(select).toHaveBeenCalledWith('+password');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('records failed login attempts and locks after threshold', async () => {
      const user = {
        _id: 'user-1',
        loginAttempts: 4,
        lockUntil: undefined,
        matchPassword: jest.fn().mockResolvedValue(false),
        save: jest.fn().mockResolvedValue(undefined)
      };
      const select = jest.fn().mockResolvedValue(user);
      User.findOne.mockReturnValue({ select });

      const req = {
        body: {
          email: 'test@example.com',
          password: 'WrongPass1!'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      login(req, res, next);
      await flushPromises();

      expect(user.matchPassword).toHaveBeenCalledWith('WrongPass1!');
      expect(user.loginAttempts).toBe(5);
      expect(user.lockUntil).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects locked accounts without checking the password', async () => {
      const user = {
        _id: 'user-1',
        lockUntil: new Date(Date.now() + 60 * 1000),
        matchPassword: jest.fn()
      };
      const select = jest.fn().mockResolvedValue(user);
      User.findOne.mockReturnValue({ select });

      const req = {
        body: {
          email: 'test@example.com',
          password: 'StrongPass1!'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      login(req, res, next);
      await flushPromises();

      expect(user.matchPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(423);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Too many failed login attempts. Please try again later.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('clears prior failed login state after a successful login', async () => {
      const user = {
        _id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'jobseeker',
        isEmailVerified: true,
        loginAttempts: 2,
        lockUntil: new Date(Date.now() - 60 * 1000),
        matchPassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(undefined)
      };
      const select = jest.fn().mockResolvedValue(user);
      User.findOne.mockReturnValue({ select });

      const req = {
        body: {
          email: 'test@example.com',
          password: 'StrongPass1!'
        }
      };
      const res = createResponse();
      const next = jest.fn();

      login(req, res, next);
      await flushPromises();

      expect(user.loginAttempts).toBe(0);
      expect(user.lockUntil).toBeUndefined();
      expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(generateToken).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          _id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'jobseeker',
          isEmailVerified: true,
          token: 'signed-test-token'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('profile and account recovery', () => {
    it('returns the authenticated profile summary', async () => {
      const user = {
        _id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'jobseeker',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z')
      };
      User.findById.mockResolvedValue(user);

      const req = { user: { _id: 'user-1' } };
      const res = createResponse();
      const next = jest.fn();

      getProfile(req, res, next);
      await flushPromises();

      expect(User.findById).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          _id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'jobseeker',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 404 for forgot password when the email is unknown', async () => {
      User.findOne.mockResolvedValue(null);

      const req = { body: { email: 'missing@example.com' } };
      const res = createResponse();
      const next = jest.fn();

      forgotPassword(req, res, next);
      await flushPromises();

      expect(sendEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No user found with this email'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('sends a forgot password email with a reset link', async () => {
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        getResetPasswordToken: jest.fn(() => 'plain-reset-token'),
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.findOne.mockResolvedValue(user);
      sendEmail.mockResolvedValue(undefined);

      const req = { body: { email: 'test@example.com' } };
      const res = createResponse();
      const next = jest.fn();

      forgotPassword(req, res, next);
      await flushPromises();

      expect(user.getResetPasswordToken).toHaveBeenCalledWith();
      expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        subject: 'Password Reset Request - SkillMatch',
        html: expect.stringContaining('https://skillmatch.example.com/reset-password/plain-reset-token')
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset email sent',
        data: { email: 'test@example.com' }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('clears reset token fields when forgot password email sending fails', async () => {
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        resetPasswordToken: 'hashed-reset-token',
        resetPasswordExpire: Date.now() + 600000,
        getResetPasswordToken: jest.fn(() => 'plain-reset-token'),
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.findOne.mockResolvedValue(user);
      sendEmail.mockRejectedValue(new Error('smtp unavailable'));

      const req = { body: { email: 'test@example.com' } };
      const res = createResponse();
      const next = jest.fn();

      forgotPassword(req, res, next);
      await flushPromises();

      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpire).toBeUndefined();
      expect(user.save).toHaveBeenLastCalledWith({ validateBeforeSave: false });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email could not be sent'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid reset password tokens', async () => {
      User.findOne.mockResolvedValue(null);

      const req = {
        params: { token: 'bad-token' },
        body: { password: 'NewPass1!' }
      };
      const res = createResponse();
      const next = jest.fn();

      resetPassword(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired reset token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('resets a password and returns a fresh token', async () => {
      const user = {
        _id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'jobseeker',
        isEmailVerified: true,
        resetPasswordToken: 'hashed-reset-token',
        resetPasswordExpire: Date.now() + 600000,
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.findOne.mockResolvedValue(user);

      const req = {
        params: { token: 'plain-reset-token' },
        body: { password: 'NewPass1!' }
      };
      const res = createResponse();
      const next = jest.fn();

      resetPassword(req, res, next);
      await flushPromises();

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: expect.any(String),
        resetPasswordExpire: { $gt: expect.any(Number) }
      });
      expect(user.password).toBe('NewPass1!');
      expect(user.resetPasswordToken).toBeUndefined();
      expect(user.resetPasswordExpire).toBeUndefined();
      expect(user.save).toHaveBeenCalledWith();
      expect(generateToken).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset successful',
        data: {
          _id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'jobseeker',
          isEmailVerified: true,
          token: 'signed-test-token'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('email verification', () => {
    it('rejects invalid email verification tokens', async () => {
      User.findOne.mockResolvedValue(null);

      const req = { params: { token: 'bad-token' } };
      const res = createResponse();
      const next = jest.fn();

      verifyEmail(req, res, next);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired verification token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('verifies an email and returns a token', async () => {
      const user = {
        _id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'jobseeker',
        isEmailVerified: false,
        emailVerificationToken: 'hashed-token',
        emailVerificationExpire: Date.now() + 600000,
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.findOne.mockResolvedValue(user);

      const req = { params: { token: 'plain-verification-token' } };
      const res = createResponse();
      const next = jest.fn();

      verifyEmail(req, res, next);
      await flushPromises();

      expect(user.isEmailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeUndefined();
      expect(user.emailVerificationExpire).toBeUndefined();
      expect(user.save).toHaveBeenCalledWith();
      expect(generateToken).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email verified successfully',
        data: {
          _id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'jobseeker',
          isEmailVerified: true,
          token: 'signed-test-token'
        }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects resend verification for already verified users', async () => {
      User.findOne.mockResolvedValue({
        email: 'test@example.com',
        isEmailVerified: true
      });

      const req = { body: { email: 'test@example.com' } };
      const res = createResponse();
      const next = jest.fn();

      resendVerification(req, res, next);
      await flushPromises();

      expect(sendEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email is already verified'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('sends a verification email for unverified users', async () => {
      const user = {
        name: 'Test User',
        email: 'test@example.com',
        isEmailVerified: false,
        getEmailVerificationToken: jest.fn(() => 'plain-verification-token'),
        save: jest.fn().mockResolvedValue(undefined)
      };
      User.findOne.mockResolvedValue(user);
      sendEmail.mockResolvedValue(undefined);

      const req = { body: { email: 'test@example.com' } };
      const res = createResponse();
      const next = jest.fn();

      resendVerification(req, res, next);
      await flushPromises();

      expect(user.getEmailVerificationToken).toHaveBeenCalledWith();
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        subject: 'Verify Your Email - SkillMatch',
        html: expect.stringContaining('https://skillmatch.example.com/verify-email/plain-verification-token')
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Verification email sent',
        data: { email: 'test@example.com' }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});

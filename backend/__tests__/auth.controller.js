jest.mock('../models/User.model', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../utils/generateToken', () => jest.fn(() => 'signed-test-token'));
jest.mock('../utils/sendEmail', () => jest.fn());

const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const { register, login } = require('../controllers/auth.controller');

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('auth controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});

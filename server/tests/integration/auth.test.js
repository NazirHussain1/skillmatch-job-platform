import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import mongoose from 'mongoose';
import User from '../../src/modules/users/user.model.js';
import tokenBlacklist from '../../src/utils/tokenBlacklist.js';

describe('Authentication Integration Tests', () => {
  let server;
  let testUser;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/skillmatch-test');
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
    await tokenBlacklist.clear();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
      
      // Check refresh token cookie
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User 2',
          email: 'test@example.com',
          password: 'Password456!',
          role: 'job_seeker'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User'
          // Missing email, password, role
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123!',
          role: 'job_seeker'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123', // Too weak
          role: 'job_seeker'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      
      accessToken = response.body.data.token;
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should set refresh token cookie on login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('refreshToken'))).toBe(true);
      expect(cookies.some(cookie => cookie.includes('HttpOnly'))).toBe(true);
    });
  });

  describe('Token Refresh Flow', () => {
    beforeEach(async () => {
      // Create and login user
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });

      accessToken = signupResponse.body.data.token;
      
      // Extract refresh token from cookie
      const cookies = signupResponse.headers['set-cookie'];
      refreshToken = cookies
        .find(cookie => cookie.startsWith('refreshToken='))
        ?.split(';')[0]
        .split('=')[1];
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      
      // Should get new refresh token
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });

    it('should reject refresh without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid_token']);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should rotate refresh tokens on refresh', async () => {
      const firstRefresh = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      const newRefreshToken = firstRefresh.headers['set-cookie']
        .find(cookie => cookie.startsWith('refreshToken='))
        ?.split(';')[0]
        .split('=')[1];

      expect(newRefreshToken).toBeDefined();
      expect(newRefreshToken).not.toBe(refreshToken);

      // Old refresh token should not work
      const secondRefresh = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(secondRefresh.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });

      accessToken = response.body.data.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should blacklist token on logout', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      // Try to use blacklisted token
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(401);
    });

    it('should clear refresh token cookie on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('refreshToken=;'))).toBe(true);
    });

    it('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });

  describe('Role-Based Access Control', () => {
    let jobSeekerToken;
    let employerToken;
    let adminToken;

    beforeEach(async () => {
      // Create job seeker
      const seekerResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Job Seeker',
          email: 'seeker@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });
      jobSeekerToken = seekerResponse.body.data.token;

      // Create employer
      const employerResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Employer',
          email: 'employer@example.com',
          password: 'Password123!',
          role: 'employer',
          companyName: 'Test Company'
        });
      employerToken = employerResponse.body.data.token;

      // Create admin
      const adminUser = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'admin'
      });
      
      const tokenManager = (await import('../../src/utils/tokenManager.js')).default;
      adminToken = tokenManager.generateAccessToken(adminUser._id);
    });

    it('should allow job seeker to access job seeker routes', async () => {
      const response = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${jobSeekerToken}`);

      expect(response.status).not.toBe(403);
    });

    it('should allow employer to access employer routes', async () => {
      const response = await request(app)
        .get('/api/applications/employer')
        .set('Authorization', `Bearer ${employerToken}`);

      expect(response.status).not.toBe(403);
    });

    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/analytics/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).not.toBe(403);
    });

    it('should deny job seeker access to employer routes', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${jobSeekerToken}`)
        .send({
          title: 'Test Job',
          description: 'Test Description'
        });

      expect(response.status).toBe(403);
    });

    it('should deny employer access to admin routes', async () => {
      const response = await request(app)
        .get('/api/analytics/admin')
        .set('Authorization', `Bearer ${employerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Security', () => {
    it('should rate limit login attempts', async () => {
      const attempts = [];
      
      // Make 6 login attempts (limit is 5)
      for (let i = 0; i < 6; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong'
            })
        );
      }

      const responses = await Promise.all(attempts);
      const lastResponse = responses[responses.length - 1];

      expect(lastResponse.status).toBe(429); // Too Many Requests
    });

    it('should sanitize user input', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: '<script>alert("xss")</script>',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });

      if (response.status === 201) {
        expect(response.body.data.user.name).not.toContain('<script>');
      }
    });

    it('should not expose sensitive data in responses', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'job_seeker'
        });

      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('refreshTokens');
    });
  });
});

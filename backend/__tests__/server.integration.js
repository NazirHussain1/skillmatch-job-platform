jest.mock('../utils/readiness', () => ({
  REQUIRED_ENV_VARS: ['MONGODB_URI', 'JWT_SECRET'],
  getReadiness: jest.fn()
}));

const request = require('supertest');
const { getReadiness } = require('../utils/readiness');

describe('server public operational routes', () => {
  let app;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://localhost/test';
    process.env.JWT_SECRET = 'test-secret';
    ({ app } = require('../server'));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns health status without requiring authentication', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Server is running');
    expect(response.body.environment).toBe('test');
    expect(response.body.timestamp).toBeTruthy();
  });

  it('returns 200 from readiness when checks pass', async () => {
    getReadiness.mockReturnValue({
      ready: true,
      status: 'ready',
      checks: {
        database: 'connected',
        environment: 'configured'
      },
      missingEnvVars: [],
      timestamp: new Date().toISOString()
    });

    const response = await request(app)
      .get('/api/ready')
      .expect(200);

    expect(response.body.ready).toBe(true);
    expect(response.body.status).toBe('ready');
    expect(response.body.checks.database).toBe('connected');
  });

  it('returns 503 from readiness when checks fail', async () => {
    getReadiness.mockReturnValue({
      ready: false,
      status: 'not_ready',
      checks: {
        database: 'disconnected',
        environment: 'configured'
      },
      missingEnvVars: [],
      timestamp: new Date().toISOString()
    });

    const response = await request(app)
      .get('/api/ready')
      .expect(503);

    expect(response.body.ready).toBe(false);
    expect(response.body.status).toBe('not_ready');
    expect(response.body.checks.database).toBe('disconnected');
  });
});

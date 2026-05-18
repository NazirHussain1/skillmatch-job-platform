jest.mock('mongoose', () => ({
  connection: {
    readyState: 0
  }
}));

const mongoose = require('mongoose');
const { REQUIRED_ENV_VARS, getReadiness } = require('../utils/readiness');

describe('getReadiness', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    REQUIRED_ENV_VARS.forEach((varName) => {
      process.env[varName] = 'configured';
    });
    mongoose.connection.readyState = 1;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns ready when required environment and database are available', () => {
    const readiness = getReadiness();

    expect(readiness.ready).toBe(true);
    expect(readiness.status).toBe('ready');
    expect(readiness.checks.database).toBe('connected');
    expect(readiness.checks.environment).toBe('configured');
    expect(readiness.missingEnvVars).toEqual([]);
  });

  it('returns not ready when required environment values are missing', () => {
    delete process.env.JWT_SECRET;

    const readiness = getReadiness();

    expect(readiness.ready).toBe(false);
    expect(readiness.status).toBe('not_ready');
    expect(readiness.checks.environment).toBe('missing_required_values');
    expect(readiness.missingEnvVars).toContain('JWT_SECRET');
  });

  it('returns not ready when the database is disconnected', () => {
    mongoose.connection.readyState = 0;

    const readiness = getReadiness();

    expect(readiness.ready).toBe(false);
    expect(readiness.status).toBe('not_ready');
    expect(readiness.checks.database).toBe('disconnected');
  });
});

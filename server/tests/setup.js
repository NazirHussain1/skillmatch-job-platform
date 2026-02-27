import { beforeAll, afterAll } from '@jest/globals';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up test environment...');
});

// Global test teardown
afterAll(async () => {
  console.log('✅ Test environment cleaned up');
});

// Increase timeout for integration tests
jest.setTimeout(30000);

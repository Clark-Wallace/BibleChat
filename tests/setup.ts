import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock Redis if not available in test environment
jest.mock('../src/services/cache/redis.service', () => ({
  default: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(-1),
    flushall: jest.fn().mockResolvedValue('OK'),
    getJSON: jest.fn().mockResolvedValue(null),
    setJSON: jest.fn().mockResolvedValue('OK'),
    getStatus: jest.fn().mockReturnValue({ connected: false, client: false }),
  }
}));

// Global test utilities
declare global {
  var testApiKey: string;
}

global.testApiKey = process.env.TEST_API_KEY || 'test-api-key-placeholder';

// Increase timeout for integration tests
if (process.env.TEST_TYPE === 'integration') {
  jest.setTimeout(30000);
}

// Clean up after tests
afterAll(async () => {
  // Close database connections
  const { pool } = await import('../src/models/database/database');
  if (pool && typeof pool === 'function') {
    const poolInstance = pool();
    if (poolInstance && poolInstance.end) {
      await poolInstance.end();
    }
  }
});
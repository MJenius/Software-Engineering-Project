// tests/setup.js
// Jest setup file - runs before tests

// Set environment to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = '3600';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

// src/setupTests.js
// Jest setup file - runs before tests

// Mock environment variables for testing
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = '3600';
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests

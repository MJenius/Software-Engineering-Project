// jest.config.js
// Jest configuration for unit, integration, and system tests

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'features/**/*.js',
    '!features/**/config.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
  verbose: true
};

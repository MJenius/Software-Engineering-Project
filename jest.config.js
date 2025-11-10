// jest.config.js
// Jest configuration for testing

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/database.js',
    '!src/app.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true
};

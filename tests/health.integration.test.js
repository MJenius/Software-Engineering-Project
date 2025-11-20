// tests/health.integration.test.js
// Integration test for health check endpoint

const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Health Check Endpoint - Integration Tests', () => {
  test('GET /health returns 200 with status healthy', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('version');
  });

  test('GET / returns redirect to login or dashboard', async () => {
    const response = await request(app)
      .get('/');

    expect(response.status).toBe(302);
  });
});

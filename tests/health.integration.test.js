// tests/health.integration.test.js
// Integration test for health check endpoint

const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint - Integration Tests', () => {
  test('GET /api/health returns 200 with status OK', async () => {
    const response = await request(app)
      .get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('version');
  });

  test('GET / returns welcome message with endpoints', async () => {
    const response = await request(app)
      .get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('endpoints');
  });

  test('GET /nonexistent returns 404', async () => {
    const response = await request(app)
      .get('/api/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});

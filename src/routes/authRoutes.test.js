// src/routes/authRoutes.test.js
// Integration Tests: Tests the full POST /api/auth/login endpoint with real interactions

const request = require('supertest');
const express = require('express');
const authRoutes = require('./authRoutes');
const User = require('../models/User');
const PasswordUtils = require('../utils/passwordUtils');

// Mock dependencies for integration tests
jest.mock('../models/User');
jest.mock('../utils/passwordUtils');

// Create a minimal Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/login - Integration Tests (SMMS-F-002)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-Auth-I01: Valid POST returns 200 and token
  test('TC-Auth-I01: Valid login returns 200 with token', async () => {
    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    User.updateLastLogin.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('john@example.com');
  });

  // TC-Auth-I02: Invalid credentials return 401
  test('TC-Auth-I02: Invalid credentials return 401', async () => {
    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.token).toBeUndefined();
  });

  // TC-Auth-I03: Non-existent user returns 401
  test('TC-Auth-I03: Non-existent user returns 401', async () => {
    User.findByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  // TC-Auth-I04: Missing email returns 400
  test('TC-Auth-I04: Missing email field returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Email and password are required');
  });

  // TC-Auth-I05: Missing password returns 400
  test('TC-Auth-I05: Missing password field returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Email and password are required');
  });

  // TC-Auth-I06: Response sanitized (no password hash)
  test('TC-Auth-I06: Response does not expose password_hash', async () => {
    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    User.updateLastLogin.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.user).not.toHaveProperty('password_hash');
  });

  // TC-Auth-I09: Invalid email format rejected
  test('TC-Auth-I09: Invalid email format returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'notanemail',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
  });

  // TC-Auth-I09b: XSS payload in email rejected
  test('TC-Auth-I09b: XSS payload in email returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: '<script>alert("xss")</script>@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
  });

  // TC-Auth-I10: Generic error message prevents user enumeration
  test('TC-Auth-I10: Generic error message prevents user enumeration', async () => {
    User.findByEmail.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'wrongpass'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
    expect(response.body.message).not.toContain('User not found');
  });

  // TC-Auth-I11: User data in response is complete
  test('TC-Auth-I11: User data includes id, email, full_name, and role', async () => {
    const mockUser = {
      id: 42,
      email: 'admin@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'Admin User',
      role: 'admin'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    User.updateLastLogin.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(42);
    expect(response.body.user.email).toBe('admin@example.com');
    expect(response.body.user.full_name).toBe('Admin User');
    expect(response.body.user.role).toBe('admin');
  });

  // TC-Auth-I12: Empty email returns 400
  test('TC-Auth-I12: Empty email returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: '',
        password: 'password123'
      });

    expect(response.status).toBe(400);
  });

  // TC-Auth-I13: Empty password returns 400
  test('TC-Auth-I13: Empty password returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: ''
      });

    expect(response.status).toBe(400);
  });

  // TC-Auth-I14: Short password rejected
  test('TC-Auth-I14: Password shorter than 6 characters returns 400', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'pass'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Password must be at least 6 characters');
  });
});

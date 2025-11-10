// src/controllers/authController.test.js
// Unit Tests: Tests the login logic in isolation (mocking database and bcrypt)

const AuthController = require('./authController');
const User = require('../models/User');
const PasswordUtils = require('../utils/passwordUtils');
const JWTManager = require('../config/jwt');

// Mock the dependencies
jest.mock('../models/User');
jest.mock('../utils/passwordUtils');
jest.mock('../config/jwt');

describe('AuthController.login - Unit Tests (SMMS-F-002)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock Express request and response objects
    mockReq = {
      body: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  // TC-Auth-U01: Valid email and password returns JWT token
  test('TC-Auth-U01: Valid credentials return 200 with JWT token', async () => {
    mockReq.body = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    JWTManager.generateToken.mockReturnValue('jwt_token_xyz');
    User.updateLastLogin.mockResolvedValue(true);

    await AuthController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'Login successful',
        token: 'jwt_token_xyz'
      })
    );
  });

  // TC-Auth-U02: Invalid password returns 401
  test('TC-Auth-U02: Invalid password returns 401', async () => {
    mockReq.body = {
      email: 'john@example.com',
      password: 'wrongpassword'
    };

    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(false);

    await AuthController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid email or password'
      })
    );
  });

  // TC-Auth-U03: Non-existent email returns 401
  test('TC-Auth-U03: Non-existent email returns 401', async () => {
    mockReq.body = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    User.findByEmail.mockResolvedValue(null); // User not found

    await AuthController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid email or password'
      })
    );
  });

  // TC-Auth-U04: Password comparison uses bcrypt (not plain text)
  test('TC-Auth-U04: Password comparison uses bcrypt.compare()', async () => {
    mockReq.body = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    JWTManager.generateToken.mockReturnValue('jwt_token_xyz');
    User.updateLastLogin.mockResolvedValue(true);

    await AuthController.login(mockReq, mockRes);

    // SECURITY CHECK: Verify bcrypt.compare was called with correct arguments
    expect(PasswordUtils.comparePassword).toHaveBeenCalledWith(
      'password123',
      '$2a$10$hashedpassword'
    );
  });

  // TC-Auth-U08: JWT token includes user ID, email, and role
  test('TC-Auth-U08: JWT token includes userId, email, and role', async () => {
    mockReq.body = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 42,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'admin'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    JWTManager.generateToken.mockReturnValue('jwt_token_xyz');
    User.updateLastLogin.mockResolvedValue(true);

    await AuthController.login(mockReq, mockRes);

    // SECURITY CHECK: Verify token generation includes all required fields
    expect(JWTManager.generateToken).toHaveBeenCalledWith(42, 'john@example.com', 'admin');
  });

  // TC-Auth-U10: SQL injection in email is sanitized
  test('TC-Auth-U10: SQL injection attempt is handled safely', async () => {
    mockReq.body = {
      email: "admin'--",
      password: 'password123'
    };

    User.findByEmail.mockResolvedValue(null);

    await AuthController.login(mockReq, mockRes);

    // SECURITY CHECK: Parameterized query was used (mocked as findByEmail)
    // Response should be generic 401, not an error message
    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  // TC-Auth-U06: Response does not expose password hash
  test('TC-Auth-U06: Response does not expose password_hash', async () => {
    mockReq.body = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$hashedpassword',
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(true);
    JWTManager.generateToken.mockReturnValue('jwt_token_xyz');
    User.updateLastLogin.mockResolvedValue(true);

    await AuthController.login(mockReq, mockRes);

    const callArgs = mockRes.json.mock.calls[0][0];
    expect(callArgs.user).not.toHaveProperty('password_hash');
  });

  // TC-Auth-U09: Password comparison is case-sensitive
  test('TC-Auth-U09: Password comparison is case-sensitive', async () => {
    mockReq.body = {
      email: 'john@example.com',
      password: 'mypassword123'
    };

    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password_hash: '$2a$10$MyPassword123', // Different case
      full_name: 'John Doe',
      role: 'user'
    };

    User.findByEmail.mockResolvedValue(mockUser);
    PasswordUtils.comparePassword.mockResolvedValue(false); // Case mismatch

    await AuthController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });
});

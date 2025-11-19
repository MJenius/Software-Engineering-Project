/**
 * Auth Module Routes
 * SMMS-F-001: User registration
 * SMMS-F-002: User login
 * SMMS-SR-001: Password hashing
 * SMMS-SR-003: Input validation
 */

const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../../database');
const logger = require('../../shared/logging/logger');
const rateLimiter = require('../../shared/security/rate-limiter');
const sanitizer = require('../../shared/security/sanitizer');
const validators = require('./validators');
const config = require('./config');

const router = express.Router();

/**
 * GET /auth/register - Display registration form
 */
router.get('/register', (req, res) => {
  res.render('auth/register', { errors: [] });
});

/**
 * POST /auth/register - Handle user registration
 * SMMS-F-001: User registration
 * SMMS-SR-001: Password hashing
 * SMMS-SR-003: Input validation
 */
router.post(
  '/register',
  validators.registrationValidation,
  async (req, res) => {
    const errors = validators.getValidationErrors(req);
    if (!errors.isEmpty()) {
      logger.warn('Registration validation failed', { errors: errors.array() });
      return res.render('auth/register', { errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Additional security checks
      const emailValidation = sanitizer.validateInput(email, { maxLength: 255 });
      if (!emailValidation.valid) {
        logger.security('Registration attempt with invalid email', { email, reason: emailValidation.error });
        return res.render('auth/register', {
          errors: [{ msg: 'Invalid email format.' }],
        });
      }

      // Check if user already exists
      const existingUser = await db.get(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        logger.warn('Registration attempt with existing email', { email });
        return res.render('auth/register', {
          errors: [{ msg: 'Email already registered.' }],
        });
      }

      // Hash password (SMMS-SR-001: Password hashing with bcrypt)
      const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

      // Insert new user
      const result = await db.run(
        'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)',
        [email, passwordHash, 'user', 1]
      );

      logger.auth('User registered successfully', { userId: result.lastID, email });
      req.session.success_msg = 'Registration successful! Please log in.';
      res.redirect('/auth/login');
    } catch (err) {
      logger.error('Registration error', { error: err.message });
      res.render('auth/register', {
        errors: [{ msg: 'An error occurred during registration.' }],
      });
    }
  }
);

/**
 * GET /auth/login - Display login form
 */
router.get('/login', (req, res) => {
  const registered = req.query.registered === 'true';
  res.render('auth/login', { errors: [], registered });
});

/**
 * POST /auth/login - Handle user login
 * SMMS-F-002: User login
 * SMMS-SR-002: Session timeout implemented
 * SMMS-SR-003: Rate limiting to prevent brute force attacks
 * SMMS-SR-004: Authorization - only authenticated users can proceed
 */
router.post(
  '/login',
  validators.loginValidation,
  async (req, res) => {
    const errors = validators.getValidationErrors(req);
    if (!errors.isEmpty()) {
      logger.warn('Login validation failed', { errors: errors.array() });
      return res.render('auth/login', {
        errors: errors.array(),
        registered: false,
      });
    }

    try {
      const { email, password } = req.body;

      // Rate limiting check (SMMS-SR-003: Brute force protection)
      const rateLimitResult = rateLimiter.trackLoginAttempt(email);
      if (!rateLimitResult.allowed) {
        logger.security('Login rate limit exceeded', { email, remainingMinutes: rateLimitResult.remainingMinutes });
        return res.render('auth/login', {
          errors: [{ msg: rateLimitResult.message }],
          registered: false,
        });
      }

      // Input validation
      const emailValidation = sanitizer.validateInput(email, { maxLength: 255 });
      if (!emailValidation.valid) {
        logger.security('Login attempt with invalid email', { email, reason: emailValidation.error });
        return res.render('auth/login', {
          errors: [{ msg: 'Invalid email or password.' }],
          registered: false,
        });
      }

      // Find user by email
      const user = await db.get(
        'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ?',
        [email]
      );

      if (!user) {
        logger.warn('Login attempt with non-existent email', { email });
        return res.status(401).render('auth/login', {
          errors: [{ msg: 'Invalid email or password.' }],
          registered: false,
        });
      }

      // Check if account is active
      if (!user.is_active) {
        logger.warn('Login attempt with deactivated account', { email, userId: user.id });
        return res.render('auth/login', {
          errors: [{ msg: 'Your account has been deactivated. Please contact an administrator.' }],
          registered: false,
        });
      }

      // Verify password (SMMS-SR-001: Password hashing verification)
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        logger.warn('Failed login attempt - incorrect password', { email, userId: user.id });
        return res.status(401).render('auth/login', {
          errors: [{ msg: 'Invalid email or password.' }],
          registered: false,
        });
      }

      // Reset rate limiter on successful login
      rateLimiter.resetLoginAttempts(email);

      // Set session
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      req.session.userRole = user.role;
      req.session.loginTime = Date.now();
      req.session.lastActivity = Date.now();

      logger.auth('User logged in successfully', { userId: user.id, email: user.email, role: user.role });
      req.session.success_msg = 'Welcome back!';
      res.redirect('/dashboard');
    } catch (err) {
      logger.error('Login error', { error: err.message, email: req.body.email });
      res.render('auth/login', {
        errors: [{ msg: 'An error occurred during login.' }],
        registered: false,
      });
    }
  }
);

/**
 * GET /auth/logout - Handle user logout
 */
router.get('/logout', (req, res) => {
  const userId = req.session.userId;
  const email = req.session.userEmail;

  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error', { error: err.message, userId });
    } else {
      logger.auth('User logged out', { userId, email });
    }
    res.redirect('/auth/login');
  });
});

module.exports = router;

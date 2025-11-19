const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const logger = require('../utils/logger');
const rateLimiter = require('../utils/rateLimiter');
const sanitizer = require('../utils/sanitizer');

const router = express.Router();

/**
 * GET /auth/register - Display registration form
 */
router.get('/register', (req, res) => {
  res.render('register', { errors: [] });
});

/**
 * POST /auth/register - Handle user registration
 * SMMS-F-001: User registration
 * SMMS-SR-001: Password hashing
 * SMMS-SR-003: Input validation
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address.')
      .custom((value) => {
        // Additional XSS check
        if (sanitizer.containsXss(value)) {
          throw new Error('Invalid email format');
        }
        return true;
      }),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character (!@#$%^&*).'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Registration validation failed', { errors: errors.array() });
      return res.render('register', { errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Additional security checks
      const emailValidation = sanitizer.validateInput(email, { maxLength: 255 });
      if (!emailValidation.valid) {
        logger.security('Registration attempt with invalid email', { email, reason: emailValidation.error });
        return res.render('register', {
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
        return res.render('register', {
          errors: [{ msg: 'Email already registered.' }],
        });
      }

      // Hash password (SMMS-SR-001: Password hashing with bcrypt)
      const passwordHash = await bcrypt.hash(password, 12); // 12 rounds for extra security

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
      res.render('register', {
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
  res.render('login', { errors: [], registered });
});

/**
 * POST /auth/login - Handle user login
 * SMMS-F-002: User login
 * SMMS-SR-002: Session timeout implemented in server.js (15 minutes)
 * SMMS-SR-003: Rate limiting to prevent brute force attacks
 * SMMS-SR-004: Authorization - only authenticated users can proceed
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address.')
      .custom((value) => {
        if (sanitizer.containsXss(value) || sanitizer.containsSqlInjection(value)) {
          throw new Error('Invalid email format');
        }
        return true;
      }),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Login validation failed', { errors: errors.array() });
      return res.render('login', {
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
        return res.render('login', {
          errors: [{ msg: rateLimitResult.message }],
          registered: false,
        });
      }

      // Input validation
      const emailValidation = sanitizer.validateInput(email, { maxLength: 255 });
      if (!emailValidation.valid) {
        logger.security('Login attempt with invalid email', { email, reason: emailValidation.error });
        return res.render('login', {
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
        return res.render('login', {
          errors: [{ msg: 'Invalid email or password.' }],
          registered: false,
        });
      }

      // Check if account is active
      if (!user.is_active) {
        logger.warn('Login attempt with deactivated account', { email, userId: user.id });
        return res.render('login', {
          errors: [{ msg: 'Your account has been deactivated. Please contact an administrator.' }],
          registered: false,
        });
      }

      // Verify password (SMMS-SR-001: Password hashing verification)
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        logger.warn('Failed login attempt - incorrect password', { email, userId: user.id });
        return res.status(401).render('login', {
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

      logger.auth('User logged in successfully', { userId: user.id, email: user.email, role: user.role });
      req.session.success_msg = 'Welcome back!';
      res.redirect('/dashboard');
    } catch (err) {
      logger.error('Login error', { error: err.message, email: req.body.email });
      res.render('login', {
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

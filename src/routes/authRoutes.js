// src/routes/authRoutes.js
// SECURITY: Rate limiting to prevent brute force attacks (SMMS-SR-005 Brute Force Protection)

const express = require('express');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/authController');
const { validateLoginInput } = require('../middleware/validation');

const router = express.Router();

// SECURITY: Rate limiter - max 5 login attempts per 15 minutes per IP
// Prevents brute force attacks on login endpoint
// In test environment, rate limiting is skipped (configured in Jest)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' // Skip rate limit in test environment
});

// POST /api/auth/login
// Applies: rate limiter → input validation → controller logic
router.post(
  '/login',
  loginLimiter,
  validateLoginInput,
  AuthController.login
);

module.exports = router;

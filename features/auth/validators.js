/**
 * Auth Module Validators
 * SMMS-F-001, F-002, SR-001, SR-003
 */

const { body, validationResult } = require('express-validator');
const sanitizer = require('../../shared/security/sanitizer');
const config = require('./config');

/**
 * Registration validation rules
 */
const registrationValidation = [
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
    .isLength({ min: config.passwordRules.minLength })
    .withMessage(`Password must be at least ${config.passwordRules.minLength} characters long.`)
    .matches(config.passwordPattern)
    .withMessage(`Password must contain uppercase, lowercase, number, and special character (${config.passwordRules.specialChars}).`),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];

/**
 * Login validation rules
 */
const loginValidation = [
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
];

/**
 * Extract validation errors
 */
function getValidationErrors(req) {
  return validationResult(req);
}

module.exports = {
  registrationValidation,
  loginValidation,
  getValidationErrors,
};

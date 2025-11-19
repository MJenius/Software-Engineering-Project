/**
 * Posts Module Validators
 * SMMS-F-005, F-008, F-012, SR-003
 */

const { body, validationResult } = require('express-validator');
const sanitizer = require('../../shared/security/sanitizer');
const config = require('./config');

/**
 * Post creation validation rules
 */
const createPostValidation = [
  body('title')
    .trim()
    .isLength({ max: config.content.titleMaxLength })
    .withMessage(`Title must be less than ${config.content.titleMaxLength} characters.`)
    .escape()
    .custom((value) => {
      if (sanitizer.containsXss(value) || sanitizer.containsSqlInjection(value)) {
        throw new Error('Invalid characters in title');
      }
      return true;
    }),
  body('content')
    .trim()
    .isLength({ min: config.content.contentMinLength, max: config.content.contentMaxLength })
    .withMessage(`Content must be between ${config.content.contentMinLength} and ${config.content.contentMaxLength} characters.`)
    .escape()
    .custom((value) => {
      if (sanitizer.containsXss(value) || sanitizer.containsSqlInjection(value)) {
        throw new Error('Invalid characters in content');
      }
      return true;
    }),
];

/**
 * Post schedule validation rules
 */
const schedulePostValidation = [
  body('postId')
    .isInt()
    .withMessage('Invalid post ID.'),
  body('scheduledTime')
    .isISO8601()
    .withMessage('Invalid date/time format.'),
];

/**
 * Post publish validation rules
 */
const publishPostValidation = [
  body('postId')
    .isInt()
    .withMessage('Invalid post ID.'),
];

/**
 * Post edit validation rules
 */
const editPostValidation = [
  body('title')
    .trim()
    .isLength({ max: config.content.titleMaxLength })
    .withMessage(`Title must be less than ${config.content.titleMaxLength} characters.`)
    .escape(),
  body('content')
    .trim()
    .isLength({ min: config.content.contentMinLength, max: config.content.contentMaxLength })
    .withMessage(`Content must be between ${config.content.contentMinLength} and ${config.content.contentMaxLength} characters.`)
    .escape(),
  body('status')
    .isIn(['draft', 'scheduled', 'published'])
    .withMessage('Invalid status'),
  body('scheduledTime')
    .custom((value, { req }) => {
      // Only validate scheduledTime if status is 'scheduled'
      if (req.body.status === 'scheduled') {
        if (!value) {
          throw new Error('Scheduled time is required when status is scheduled');
        }
        // Check if it's a valid date
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid scheduled time format');
        }
      }
      return true;
    }),
];

/**
 * Extract validation errors
 */
function getValidationErrors(req) {
  return validationResult(req);
}

module.exports = {
  createPostValidation,
  schedulePostValidation,
  publishPostValidation,
  editPostValidation,
  getValidationErrors,
};

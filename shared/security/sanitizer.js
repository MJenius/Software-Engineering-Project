/**
 * Input Sanitization Utility for SMMS
 * SMMS-SR-003: Input validation to prevent XSS and SQL injection
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
function sanitizeHtml(input) {
  if (typeof input !== 'string') return input;

  // Replace dangerous HTML characters
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Detect potential SQL injection patterns
 */
function containsSqlInjection(input) {
  if (typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i, // OR 1=1, AND 1=1
    /'\s*(OR|AND)\s+'.*?'\s*=\s*'/i, // 'OR'='OR'
    /--/g, // SQL comments
    /\/\*.*?\*\//g, // Multi-line comments
    /;\s*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER)\s+/i, // Dangerous SQL commands
    /UNION\s+SELECT/i, // UNION based injection
    /xp_cmdshell/i, // Command execution
    /exec\s*\(/i, // Execute functions
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Detect potential XSS patterns
 */
function containsXss(input) {
  if (typeof input !== 'string') return false;

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /eval\s*\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize user input
 */
function validateInput(input, options = {}) {
  const {
    maxLength = 5000,
    allowHtml = false,
    checkSqlInjection = true,
    checkXss = true,
  } = options;

  // Check for null/undefined
  if (input === null || input === undefined) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  // Convert to string
  const inputStr = String(input);

  // Check length
  if (inputStr.length > maxLength) {
    return { valid: false, error: `Input exceeds maximum length of ${maxLength} characters` };
  }

  // Check for SQL injection
  if (checkSqlInjection && containsSqlInjection(inputStr)) {
    return { valid: false, error: 'Invalid input detected', security: 'SQL_INJECTION_ATTEMPT' };
  }

  // Check for XSS
  if (checkXss && containsXss(inputStr)) {
    return { valid: false, error: 'Invalid input detected', security: 'XSS_ATTEMPT' };
  }

  // Sanitize HTML if not allowed
  const sanitized = allowHtml ? inputStr : sanitizeHtml(inputStr);

  return {
    valid: true,
    sanitized: sanitized,
    original: inputStr,
  };
}

/**
 * Sanitize object fields recursively
 */
function sanitizeObject(obj, options = {}) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        const result = validateInput(value, options);
        sanitized[key] = result.valid ? result.sanitized : value;
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value, options);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Validate file upload
 */
function validateFileUpload(file, options = {}) {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `File type ${file.mimetype} is not allowed`,
    };
  }

  // Check file extension matches mimetype
  const extension = file.originalname.split('.').pop().toLowerCase();
  const mimetypeExtension = file.mimetype.split('/')[1];

  if (extension !== mimetypeExtension && extension !== 'jpg' && mimetypeExtension !== 'jpeg') {
    return {
      valid: false,
      error: 'File extension does not match file type',
    };
  }

  return { valid: true };
}

module.exports = {
  sanitizeHtml,
  containsSqlInjection,
  containsXss,
  validateInput,
  sanitizeObject,
  validateFileUpload,
};

/**
 * Auth Module Configuration
 * SMMS-F-001, F-002, SR-001, SR-002, SR-004
 */

module.exports = {
  bcryptRounds: 12, // SMMS-SR-001: Password hashing strength
  sessionTimeout: 15 * 60 * 1000, // 15 minutes (SMMS-SR-002)
  passwordRules: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*',
  },
  emailValidationPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
};

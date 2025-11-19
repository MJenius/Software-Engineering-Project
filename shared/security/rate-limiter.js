/**
 * Rate Limiter Utility for SMMS
 * SMMS-SR-003: Brute force protection
 */

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const loginAttempts = {}; // In-memory store

/**
 * Track login attempts and check if account is locked
 */
function trackLoginAttempt(email) {
  const now = Date.now();
  
  // Initialize tracking for this email if needed
  if (!loginAttempts[email]) {
    loginAttempts[email] = { attempts: 0, firstAttemptTime: now };
  }

  const attempt = loginAttempts[email];

  // Check if lockout period has expired
  if (now - attempt.firstAttemptTime > LOCKOUT_DURATION) {
    // Reset counter after lockout expires
    attempt.attempts = 0;
    attempt.firstAttemptTime = now;
  }

  // Increment attempt counter
  attempt.attempts++;

  if (attempt.attempts > MAX_LOGIN_ATTEMPTS) {
    const remainingMs = LOCKOUT_DURATION - (now - attempt.firstAttemptTime);
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    
    return {
      allowed: false,
      message: `Too many login attempts. Please try again in ${remainingMinutes} minute(s).`,
      remainingMinutes: remainingMinutes,
    };
  }

  return { allowed: true };
}

/**
 * Reset login attempts for successful login
 */
function resetLoginAttempts(email) {
  if (loginAttempts[email]) {
    delete loginAttempts[email];
  }
}

/**
 * Get attempt count for an email
 */
function getAttemptCount(email) {
  if (!loginAttempts[email]) {
    return 0;
  }
  return loginAttempts[email].attempts;
}

/**
 * Clear all attempts (useful for testing or maintenance)
 */
function clearAllAttempts() {
  for (const key in loginAttempts) {
    delete loginAttempts[key];
  }
}

module.exports = {
  trackLoginAttempt,
  resetLoginAttempts,
  getAttemptCount,
  clearAllAttempts,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
};

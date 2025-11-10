// src/utils/passwordUtils.js
// SECURITY: Handles password hashing and comparison (SMMS-SR-001 Password Hashing with Bcrypt)

const bcrypt = require('bcryptjs');

class PasswordUtils {
  // Hash a plain text password (used during registration, not in login)
  static async hashPassword(plainPassword) {
    try {
      // SECURITY: bcrypt with salt rounds = 10 (industry standard)
      // Higher rounds = slower (protects against brute force) but more CPU intensive
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      return hashedPassword;
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  // Compare plain text password with stored hash
  // SECURITY: This is critical. Never use === comparison for passwords
  static async comparePassword(plainPassword, hashedPassword) {
    try {
      // bcrypt.compare() is timing-safe against brute force attacks
      // Returns true if passwords match, false otherwise
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  }
}

module.exports = PasswordUtils;

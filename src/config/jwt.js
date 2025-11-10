// src/config/jwt.js
// SECURITY: Manages JWT token generation and validation (SMMS-SR-001 Session Management)

const jwt = require('jsonwebtoken');

class JWTManager {
  static generateToken(userId, email, role) {
    try {
      const payload = {
        userId,
        email,
        role,
        iat: Math.floor(Date.now() / 1000) // Issued at time
      };

      // SECURITY: Token expires based on JWT_EXPIRES_IN env variable
      // Default: 3600 seconds (1 hour) - session timeout
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || 3600
      });

      return token;
    } catch (error) {
      throw new Error('Token generation failed');
    }
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      return null; // Token invalid or expired
    }
  }
}

module.exports = JWTManager;

// src/controllers/authController.js
// SECURITY: Core login logic with all security checks (SMMS-F-002 User Login)

const User = require('../models/User');
const PasswordUtils = require('../utils/passwordUtils');
const JWTManager = require('../config/jwt');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Step 1: Find user in database by email (parameterized query)
      const user = await User.findByEmail(email);

      // Step 2: SECURITY - Generic error message (do NOT say "user not found")
      // Prevents attackers from enumerating valid emails
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Step 3: CRITICAL SECURITY - Compare password with stored hash using bcrypt
      // Never use === or plain text comparison
      // bcrypt.compare() is timing-safe against timing attacks
      const isPasswordValid = await PasswordUtils.comparePassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Step 4: Password is correct - generate JWT token
      const token = JWTManager.generateToken(user.id, user.email, user.role);

      // Step 5: Update last login timestamp (optional but good practice)
      try {
        await User.updateLastLogin(user.id);
      } catch (updateErr) {
        console.error('Error updating last login:', updateErr);
        // Don't fail the login if this fails
      }

      // Step 6: Return response (SECURITY: No password hash exposed)
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred during login'
      });
    }
  }
}

module.exports = AuthController;

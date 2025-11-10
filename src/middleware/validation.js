// src/middleware/validation.js
// SECURITY: Validates input to prevent XSS and malformed requests (SMMS-SR-003 Input Validation)

const validateEmail = (email) => {
  // More strict email validation that rejects XSS attempts
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Password must be at least 6 characters
  return password && password.length >= 6;
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  // Check for missing fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Validate email format (prevents XSS via malformed input)
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate password (basic check)
  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  next();
};

module.exports = { validateLoginInput, validateEmail, validatePassword };

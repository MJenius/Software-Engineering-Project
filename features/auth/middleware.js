/**
 * Auth Module Middleware
 * SMMS-SR-002, SR-004
 */

const logger = require('../../shared/logging/logger');
const config = require('./config');

/**
 * Middleware to check if user is authenticated
 * SMMS-SR-004: Restricted access control
 * SMMS-SR-002: Session timeout validation
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Check session timeout
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;
    const sessionAge = now - lastActivity;

    if (sessionAge > config.sessionTimeout) {
      logger.warn('Session expired', { userId: req.session.userId, sessionAge });
      req.session.destroy((err) => {
        if (err) logger.error('Session destroy error', { error: err.message });
      });
      req.session.error_msg = 'Your session has expired. Please log in again.';
      return res.redirect('/auth/login');
    }

    // Update last activity
    req.session.lastActivity = now;
    next();
  } else {
    res.redirect('/auth/login');
  }
};

/**
 * Middleware to check if user is admin
 * SMMS-F-004: Role-based access control
 */
const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    next();
  } else {
    logger.security('Unauthorized admin access attempt', {
      userId: req.session?.userId,
      userRole: req.session?.userRole,
      url: req.url,
    });
    return res.status(403).render('error', {
      message: 'Access Denied: Admin privileges required.',
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
};

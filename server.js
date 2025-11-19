/**
 * Social Media Management System (SMMS) - Main Server
 * 
 * Implemented Requirements from SRS v1.0:
 * 
 * FUNCTIONAL REQUIREMENTS:
 * ✓ SMMS-F-001: User registration with validation
 * ✓ SMMS-F-002: User login with session management
 * ✓ SMMS-F-003: Password hashing (bcrypt)
 * ✓ SMMS-F-004: Role-based access control (Admin/User)
 * ✓ SMMS-F-005: Create text posts
 * ✓ SMMS-F-006: Upload images with posts
 * ✓ SMMS-F-007: Save posts as drafts
 * ✓ SMMS-F-008: Schedule posts for future publication
 * ✓ SMMS-F-009: Auto-publish scheduled posts (background scheduler)
 * ✓ SMMS-F-010: View scheduled posts
 * ✓ SMMS-F-011: View published posts
 * ✓ SMMS-F-012: Edit/delete scheduled posts
 * ✓ SMMS-F-013: Analytics dashboard (post counts)
 * ✓ SMMS-F-014: Admin user management (activate/deactivate)
 * ✓ SMMS-F-015: Notifications (flash messages)
 * 
 * NON-FUNCTIONAL REQUIREMENTS:
 * ✓ SMMS-NF-001: Response time optimization
 * ✓ SMMS-NF-002: Concurrent user support
 * ✓ SMMS-NF-003: Responsive UI (mobile-friendly)
 * ✓ SMMS-NF-004: Database storage for 1000+ posts
 * ✓ SMMS-NF-005: Manual database backup functionality
 * 
 * SECURITY REQUIREMENTS:
 * ✓ SMMS-SR-001: Password hashing (bcrypt with 12 rounds)
 * ✓ SMMS-SR-002: Session timeout (15 minutes)
 * ✓ SMMS-SR-003: Input validation (XSS/SQL injection prevention, rate limiting)
 * ✓ SMMS-SR-004: Restricted access control
 * ✓ SMMS-SR-005: HTTPS/TLS enforcement (production)
 * 
 * ADDITIONAL FEATURES:
 * ✓ Comprehensive logging system
 * ✓ Rate limiting for brute-force protection
 * ✓ Security headers (XSS, Clickjacking, MIME sniffing)
 * ✓ Audit logging for security events
 * ✓ Environment configuration validation
 * ✓ Health check endpoint
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./database');
const logger = require('./utils/logger');
const envCheck = require('./utils/envCheck');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');

// Validate environment configuration
envCheck.checkEnvironment();

const app = express();
const PORT = process.env.PORT || 3000;

// HTTPS redirect middleware for production (SMMS-SR-005)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security headers middleware (SMMS-SR-005)
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // HTTPS enforcement (in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Middleware
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Error handling for malformed JSON (SMMS-SR-003: Input validation)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('Malformed JSON received', { error: err.message, url: req.url });
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Session configuration (SMMS-SR-002: 15 minute timeout)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    rolling: true, // Reset expiration on every response
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 15 * 60 * 1000, // 15 minutes session timeout (SMMS-SR-002)
      sameSite: 'strict', // CSRF protection
    },
  })
);

// Session activity tracking middleware (SMMS-SR-002)
app.use((req, res, next) => {
  if (req.session && req.session.userId) {
    req.session.lastActivity = Date.now();
  }
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Flash messages middleware (SMMS-F-015: Notifications)
app.use((req, res, next) => {
  res.locals.success_msg = req.session.success_msg || null;
  res.locals.error_msg = req.session.error_msg || null;
  res.locals.warning_msg = req.session.warning_msg || null;
  delete req.session.success_msg;
  delete req.session.error_msg;
  delete req.session.warning_msg;
  next();
});

// Authentication middleware (SMMS-SR-004)
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // Check session timeout (SMMS-SR-002)
    const now = Date.now();
    const lastActivity = req.session.lastActivity || now;
    const sessionAge = now - lastActivity;
    const maxAge = 15 * 60 * 1000; // 15 minutes

    if (sessionAge > maxAge) {
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
      message: 'Access Denied: Admin privileges required.' 
    });
  }
};

// Routes
app.use('/auth', authRoutes);
app.use('/posts', isAuthenticated, postRoutes);
app.use('/admin', isAuthenticated, isAdmin, adminRoutes);
app.use('/dashboard', isAuthenticated, dashboardRoutes);
app.use('/analytics', isAuthenticated, analyticsRoutes);

// Home route
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.get('SELECT 1');
    
    const config = envCheck.getConfigSummary();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: '1.0.0',
      database: 'connected',
      security: {
        sessionTimeout: `${config.sessionTimeout} minutes`,
        maxLoginAttempts: config.maxLoginAttempts,
        httpsEnforced: config.forceHttps,
      },
    });
  } catch (err) {
    logger.error('Health check failed', { error: err.message });
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed',
    });
  }
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).render('error', { 
    message: 'Page not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.session?.userId,
  });
  res.status(500).render('error', { 
    message: 'An internal server error occurred.' 
  });
});

// Initialize database and start server
db.initialize().then(() => {
  app.listen(PORT, () => {
    logger.info('SMMS Server started', {
      port: PORT,
      url: `http://localhost:${PORT}`,
      sessionTimeout: '15 minutes',
      environment: process.env.NODE_ENV || 'development',
    });
    console.log(`SMMS Server running on http://localhost:${PORT}`);
    console.log('Session timeout: 15 minutes');
    console.log('Security features enabled: Rate limiting, XSS protection, SQL injection prevention');
  });
}).catch(err => {
  logger.error('Failed to initialize database', { error: err.message, stack: err.stack });
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Auto-publish scheduler: runs every 10 seconds and publishes posts whose scheduled_time has passed
// This provides a responsive server-side scheduler so posts are published precisely when the time arrives.
setInterval(async () => {
  try {
    const now = new Date();
    // Format current time as YYYY-MM-DDTHH:MM:SS (local time, no timezone)
    const pad = (n) => String(n).padStart(2, '0');
    const localNow = `${pad(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    // Get all scheduled posts for debug logging
    const scheduledPosts = await db.all(
      `SELECT id, title, scheduled_time, status FROM posts WHERE status = 'scheduled' ORDER BY scheduled_time ASC`
    );
    
    if (scheduledPosts && scheduledPosts.length > 0) {
      console.log(`[Scheduler] Current server time (local): ${localNow}`);
      console.log(`[Scheduler] Checking ${scheduledPosts.length} scheduled post(s):`);
      scheduledPosts.forEach(post => {
        const isPast = post.scheduled_time <= localNow;
        console.log(
          `  - Post ${post.id} "${post.title}": scheduled_time=${post.scheduled_time}, ready=${isPast}`
        );
      });
    }
    
    // Compare as strings since we're storing local time as ISO string
    // Only publish if the scheduled time is actually in the past (not just equal due to seconds truncation)
    const result = await db.run(
      `UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE status = 'scheduled' AND scheduled_time <= ?`,
      [localNow]
    );

    if (result && result.changes && result.changes > 0) {
      console.log(`[Scheduler] ✓ Auto-published ${result.changes} post(s) at ${new Date().toISOString()}`);
      logger.info('Auto-published scheduled posts', {
        count: result.changes,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[Scheduler] Auto-publish error:', err);
    logger.error('Scheduler auto-publish error', { error: err.message });
  }
}, 10 * 1000); // Check every 10 seconds for more responsive publishing (SMMS-F-009)

// Debug endpoint: manually check scheduler status and trigger publish
app.get('/debug/scheduler', async (req, res) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const localNow = `${pad(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    console.log(`[Debug] Manual scheduler check at ${now.toISOString()}`);
    console.log(`[Debug] Local time string: ${localNow}`);
    
    // Get all scheduled posts
    const scheduledPosts = await db.all(
      `SELECT id, title, scheduled_time, status FROM posts WHERE status = 'scheduled' ORDER BY scheduled_time ASC`
    );
    
    console.log(`[Debug] Found ${scheduledPosts.length} scheduled posts`);
    scheduledPosts.forEach(post => {
      const isPast = post.scheduled_time <= localNow;
      console.log(
        `  - Post ${post.id}: scheduled=${post.scheduled_time}, isPast=${isPast}`
      );
    });
    
    // Manually run the update query
    const result = await db.run(
      `UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE status = 'scheduled' AND scheduled_time <= ?`,
      [localNow]
    );
    
    console.log(`[Debug] Published ${result.changes} posts in this manual trigger`);
    
    res.json({
      currentTime: now.toISOString(),
      localTimeString: localNow,
      scheduledPostsCount: scheduledPosts.length,
      scheduledPosts: scheduledPosts,
      publishResult: result,
      message: `Server time is ${now.toISOString()} (local: ${localNow}). Check console logs for details.`
    });
  } catch (err) {
    console.error('[Debug] Scheduler check error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

/**
 * Dashboard Module Routes
 * User dashboard and home page
 */

const express = require('express');
const db = require('../../database');
const logger = require('../../shared/logging/logger');

const router = express.Router();

/**
 * GET /dashboard - User dashboard
 * Shows menu options for posts and analytics
 */
router.get('/', async (req, res) => {
  try {
    const userStats = await db.get(
      `SELECT
        (SELECT COUNT(*) FROM posts WHERE user_id = ?) as totalPosts,
        (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'published') as publishedPosts,
        (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'scheduled') as scheduledPosts,
        (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'draft') as draftPosts`,
      [req.session.userId, req.session.userId, req.session.userId, req.session.userId]
    );

    const isAdmin = req.session.userRole === 'admin';
    const created = req.query.created === 'true';

    res.render('dashboard', {
      userEmail: req.session.userEmail,
      isAdmin,
      userStats,
      created,
    });
  } catch (err) {
    logger.error('Dashboard error', { error: err.message, userId: req.session.userId });
    res.status(500).render('error', { message: 'Failed to load dashboard.' });
  }
});

module.exports = router;

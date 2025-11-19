/**
 * Analytics Module Routes
 * SMMS-F-013: Analytics counts
 * Shows: total posts, scheduled posts, published posts
 */

const express = require('express');
const logger = require('../../shared/logging/logger');
const queries = require('./queries');
const config = require('./config');

const router = express.Router();

/**
 * GET /analytics - User analytics page
 * SMMS-F-013: Analytics counts
 */
router.get('/', async (req, res) => {
  try {
    const analytics = await queries.getUserAnalytics(req.session.userId);
    const monthlyData = await queries.getMonthlyBreakdown(req.session.userId, config.monthlyDataLimit);

    res.render('analytics/analytics', {
      analytics,
      monthlyData,
      userEmail: req.session.userEmail,
    });
  } catch (err) {
    logger.error('Analytics error', { error: err.message, userId: req.session.userId });
    res.status(500).render('error', { message: 'Failed to load analytics.' });
  }
});

module.exports = router;

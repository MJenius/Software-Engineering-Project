/**
 * Analytics Module - Database Queries
 * SMMS-F-013: Analytics counts
 */

const db = require('../../database');

/**
 * Get analytics for a user
 */
async function getUserAnalytics(userId) {
  const analytics = await db.get(
    `SELECT
      (SELECT COUNT(*) FROM posts WHERE user_id = ?) as totalPosts,
      (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'published') as publishedPosts,
      (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'scheduled') as scheduledPosts,
      (SELECT COUNT(*) FROM posts WHERE user_id = ? AND status = 'draft') as draftPosts`,
    [userId, userId, userId, userId]
  );

  return analytics;
}

/**
 * Get monthly breakdown of posts
 */
async function getMonthlyBreakdown(userId, limit = 12) {
  const monthlyData = await db.all(
    `SELECT 
      strftime('%Y-%m', created_at) as month,
      status,
      COUNT(*) as count
     FROM posts
     WHERE user_id = ?
     GROUP BY strftime('%Y-%m', created_at), status
     ORDER BY month DESC
     LIMIT ?`,
    [userId, limit]
  );

  return monthlyData;
}

module.exports = {
  getUserAnalytics,
  getMonthlyBreakdown,
};

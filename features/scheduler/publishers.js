/**
 * Posts Publishing/Scheduler Logic
 * SMMS-F-009: Auto-publish scheduled posts
 */

const db = require('../../database');
const logger = require('../../shared/logging/logger');

/**
 * Publish scheduled posts whose time has passed
 */
async function publishScheduledPosts() {
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

    return result;
  } catch (err) {
    console.error('[Scheduler] Auto-publish error:', err);
    logger.error('Scheduler auto-publish error', { error: err.message });
    throw err;
  }
}

module.exports = {
  publishScheduledPosts,
};

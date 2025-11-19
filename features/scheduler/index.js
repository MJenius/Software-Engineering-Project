/**
 * Scheduler Module - Initialize and manage background scheduler
 * SMMS-F-009: Auto-publish scheduled posts
 */

const config = require('./config');
const publishers = require('./publishers');

let schedulerInterval = null;

/**
 * Start the background scheduler
 */
function startScheduler() {
  if (!config.enabled) {
    console.log('[Scheduler] Scheduler is disabled');
    return;
  }

  if (schedulerInterval) {
    console.log('[Scheduler] Scheduler already running');
    return;
  }

  schedulerInterval = setInterval(async () => {
    try {
      await publishers.publishScheduledPosts();
    } catch (err) {
      console.error('[Scheduler] Error in scheduler:', err);
    }
  }, config.interval);

  console.log(`[Scheduler] Started with ${config.interval / 1000} second interval`);
}

/**
 * Stop the background scheduler
 */
function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Stopped');
  }
}

/**
 * Manually trigger publish check
 */
async function triggerPublish() {
  try {
    return await publishers.publishScheduledPosts();
  } catch (err) {
    console.error('[Scheduler] Manual trigger error:', err);
    throw err;
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  triggerPublish,
};

/**
 * Admin Module Routes
 * SMMS-F-014: Admin manage users
 * SMMS-NF-005: Manual database backup
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const logger = require('../../shared/logging/logger');
const userModels = require('./users');
const backupModels = require('./backup');

const router = express.Router();

/**
 * GET /admin - Admin dashboard
 * SMMS-F-014: Admin manage users
 */
router.get('/', async (req, res) => {
  try {
    const users = await userModels.getAllUsers();
    const stats = await userModels.getSystemStats();

    res.render('admin/admin-dashboard', { users, stats });
  } catch (err) {
    logger.error('Error fetching admin data', { error: err.message });
    res.status(500).render('error', { message: 'Failed to load admin dashboard.' });
  }
});

/**
 * POST /admin/deactivate - Deactivate a user account
 * SMMS-F-014: Admin manage users
 */
router.post(
  '/deactivate/:userId',
  [
    body('userId')
      .isInt()
      .withMessage('Invalid user ID.'),
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;
      await userModels.deactivateUser(userId, req.session.userId);
      res.json({ success: true, message: 'User account deactivated.' });
    } catch (err) {
      logger.error('Deactivation error', { error: err.message, adminId: req.session.userId });
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /admin/activate - Activate a user account
 */
router.post(
  '/activate/:userId',
  [
    body('userId')
      .isInt()
      .withMessage('Invalid user ID.'),
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;
      await userModels.activateUser(userId, req.session.userId);
      res.json({ success: true, message: 'User account activated.' });
    } catch (err) {
      logger.error('Activation error', { error: err.message, adminId: req.session.userId });
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /admin/promote - Promote a user to admin
 */
router.post(
  '/promote/:userId',
  [
    body('userId')
      .isInt()
      .withMessage('Invalid user ID.'),
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;
      await userModels.promoteToAdmin(userId);
      res.json({ success: true, message: 'User promoted to admin.' });
    } catch (err) {
      logger.error('Promotion error', { error: err.message, adminId: req.session.userId });
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /admin/demote - Demote an admin to user
 */
router.post(
  '/demote/:userId',
  [
    body('userId')
      .isInt()
      .withMessage('Invalid user ID.'),
  ],
  async (req, res) => {
    try {
      const { userId } = req.params;
      await userModels.demoteFromAdmin(userId, req.session.userId);
      res.json({ success: true, message: 'Admin demoted to user.' });
    } catch (err) {
      logger.error('Demotion error', { error: err.message, adminId: req.session.userId });
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * POST /admin/publish-scheduled - Auto-publish scheduled posts
 * Manual trigger for auto-publish feature
 */
router.post('/publish-scheduled', async (req, res) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const localNow = `${pad(now.getFullYear())}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    logger.info('Admin manually triggered scheduled post publishing', {
      adminId: req.session.userId,
      currentTime: localNow,
    });

    const db = require('../../database');
    const result = await db.run(
      `UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE status = 'scheduled' AND scheduled_time <= ?`,
      [localNow]
    );

    logger.info('Admin manual publish completed', {
      adminId: req.session.userId,
      postsPublished: result.changes,
    });

    res.json({
      success: true,
      message: result.changes > 0
        ? `${result.changes} scheduled post${result.changes > 1 ? 's have' : ' has'} been published.`
        : 'No posts were ready to be published.',
      postsPublished: result.changes,
    });
  } catch (err) {
    logger.error('Auto-publish error', { error: err.message, adminId: req.session.userId });
    res.status(500).json({ error: 'Failed to publish scheduled posts.' });
  }
});

/**
 * POST /admin/backup - Create database backup
 * SMMS-NF-005: Manual database backup
 */
router.post('/backup', async (req, res) => {
  try {
    const result = await backupModels.createBackup(req.session.userId);
    res.json(result);
  } catch (err) {
    logger.error('Backup error', { error: err.message, adminId: req.session.userId });
    res.status(500).json({ error: 'Failed to create database backup.' });
  }
});

/**
 * GET /admin/backups - List all backups
 * SMMS-NF-005: View available backups
 */
router.get('/backups', (req, res) => {
  try {
    const backups = backupModels.listBackups();
    res.json({ success: true, backups });
  } catch (err) {
    logger.error('Error listing backups', { error: err.message });
    res.status(500).json({ error: 'Failed to list backups.' });
  }
});

/**
 * GET /admin/backup/download/:fileName - Download a backup file
 */
router.get('/backup/download/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = backupModels.getBackupFilePath(fileName, req.session.userId);

    logger.info('Backup file downloaded', { adminId: req.session.userId, fileName });
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error('Backup download error', { error: err.message, fileName });
        res.status(404).json({ error: 'Backup file not found.' });
      }
    });
  } catch (err) {
    logger.error('Backup download error', { error: err.message });
    res.status(500).json({ error: 'Failed to download backup.' });
  }
});

/**
 * DELETE /admin/backup/:fileName - Delete a backup file
 */
router.delete('/backup/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const result = backupModels.deleteBackup(fileName, req.session.userId);

    if (result.success) {
      res.json({ success: true, message: 'Backup deleted successfully.' });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (err) {
    logger.error('Backup deletion error', { error: err.message });
    res.status(500).json({ error: 'Failed to delete backup.' });
  }
});

/**
 * GET /admin/users - View all users list
 * SMMS-F-014: Admin manage users
 */
router.get('/users', async (req, res) => {
  try {
    const users = await userModels.getAllUsers();
    res.render('admin/admin-users', { users });
  } catch (err) {
    logger.error('Error fetching users', { error: err.message });
    res.status(500).render('error', { message: 'Failed to load users list.' });
  }
});

/**
 * GET /admin/users/:userId/posts - View all posts by a specific user
 * SMMS-F-014: Admin view user posts
 */
router.get('/users/:userId/posts', async (req, res) => {
  try {
    const { userId } = req.params;
    const { user, posts } = await userModels.getUserPosts(userId);

    res.render('admin/admin-user-posts', { user, posts });
  } catch (err) {
    logger.error('Error fetching user posts', { error: err.message });
    res.status(500).render('error', { message: 'Failed to load user posts.' });
  }
});

/**
 * DELETE /admin/users/:userId/posts/:postId - Delete a post (admin only)
 * SMMS-F-014: Admin delete user posts
 */
router.delete('/users/:userId/posts/:postId', async (req, res) => {
  try {
    const { userId, postId } = req.params;
    await userModels.deleteUserPost(userId, postId, req.session.userId);
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    logger.error('Post deletion error', { error: err.message, adminId: req.session.userId });
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

module.exports = router;

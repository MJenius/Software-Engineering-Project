/**
 * Admin Module - User Management Models
 * SMMS-F-014: Admin manage users
 */

const db = require('../../database');
const logger = require('../../shared/logging/logger');

/**
 * Get all users
 */
async function getAllUsers() {
  const users = await db.all(
    'SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  return users;
}

/**
 * Get system statistics
 */
async function getSystemStats() {
  const stats = await db.get(`
    SELECT
      (SELECT COUNT(*) FROM users) as totalUsers,
      (SELECT COUNT(*) FROM users WHERE role = 'admin') as adminCount,
      (SELECT COUNT(*) FROM posts) as totalPosts,
      (SELECT COUNT(*) FROM posts WHERE status = 'published') as publishedPosts,
      (SELECT COUNT(*) FROM posts WHERE status = 'scheduled') as scheduledPosts,
      (SELECT COUNT(*) FROM posts WHERE status = 'draft') as draftPosts
  `);
  return stats;
}

/**
 * Deactivate a user account
 */
async function deactivateUser(userId, adminId) {
  // Prevent deactivating self
  if (parseInt(userId) === adminId) {
    throw new Error('Cannot deactivate your own account');
  }

  const user = await db.get('SELECT id, email, role FROM users WHERE id = ?', [userId]);
  if (!user) {
    throw new Error('User not found');
  }

  const result = await db.run(
    'UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [userId]
  );

  logger.auth('User account deactivated by admin', {
    adminId,
    targetUserId: userId,
    targetEmail: user.email,
  });

  return result;
}

/**
 * Activate a user account
 */
async function activateUser(userId, adminId) {
  const user = await db.get('SELECT id, email FROM users WHERE id = ?', [userId]);
  if (!user) {
    throw new Error('User not found');
  }

  const result = await db.run(
    'UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [userId]
  );

  logger.auth('User account activated by admin', {
    adminId,
    targetUserId: userId,
    targetEmail: user.email,
  });

  return result;
}

/**
 * Promote user to admin
 */
async function promoteToAdmin(userId) {
  const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role === 'admin') {
    throw new Error('User is already an admin');
  }

  const result = await db.run(
    'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['admin', userId]
  );

  return result;
}

/**
 * Demote admin to user
 */
async function demoteFromAdmin(userId, adminId) {
  // Prevent demoting self
  if (parseInt(userId) === adminId) {
    throw new Error('Cannot demote your own account');
  }

  const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'admin') {
    throw new Error('User is not an admin');
  }

  const result = await db.run(
    'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['user', userId]
  );

  return result;
}

/**
 * Get all posts by a user
 */
async function getUserPosts(userId) {
  const user = await db.get(
    'SELECT id, email, role, is_active FROM users WHERE id = ?',
    [userId]
  );

  if (!user) {
    throw new Error('User not found');
  }

  const posts = await db.all(
    `SELECT id, title, content, image_path, status, created_at, updated_at, published_at, scheduled_time
     FROM posts WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  return { user, posts };
}

/**
 * Delete a post by admin
 */
async function deleteUserPost(userId, postId, adminId) {
  const post = await db.get(
    'SELECT id, user_id, image_path FROM posts WHERE id = ? AND user_id = ?',
    [postId, userId]
  );

  if (!post) {
    throw new Error('Post not found');
  }

  // Delete the post
  await db.run('DELETE FROM posts WHERE id = ?', [postId]);

  // Clean up image file if it exists
  if (post.image_path) {
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, '../../public', post.image_path);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  logger.info('Post deleted by admin', {
    adminId,
    postId: postId,
    userId: userId,
  });

  return true;
}

module.exports = {
  getAllUsers,
  getSystemStats,
  deactivateUser,
  activateUser,
  promoteToAdmin,
  demoteFromAdmin,
  getUserPosts,
  deleteUserPost,
};

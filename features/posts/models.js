/**
 * Posts Module - Database Models/Queries
 * SMMS-F-005 through F-012
 */

const db = require('../../database');

/**
 * Create a new post
 */
async function createPost(userId, title, content, imagePath, status) {
  const result = await db.run(
    `INSERT INTO posts (user_id, title, content, image_path, status, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CASE WHEN ? = 'published' THEN CURRENT_TIMESTAMP ELSE NULL END)`,
    [userId, title || null, content, imagePath, status, status]
  );
  return result;
}

/**
 * Get draft posts for a user
 */
async function getDraftPosts(userId) {
  const posts = await db.all(
    `SELECT * FROM posts WHERE user_id = ? AND status = 'draft'
     ORDER BY created_at DESC`,
    [userId]
  );
  return posts;
}

/**
 * Get scheduled and published posts for a user
 */
async function getScheduledAndPublishedPosts(userId) {
  const posts = await db.all(
    `SELECT * FROM posts WHERE user_id = ? AND status IN ('scheduled', 'published')
     ORDER BY scheduled_time DESC`,
    [userId]
  );
  return posts;
}

/**
 * Get a single post by ID
 */
async function getPostById(postId, userId) {
  const post = await db.get(
    `SELECT posts.*, users.email as username 
     FROM posts 
     JOIN users ON posts.user_id = users.id 
     WHERE posts.id = ? AND (posts.status = 'published' OR posts.user_id = ?)`,
    [postId, userId]
  );
  return post;
}

/**
 * Schedule a post
 */
async function schedulePost(postId, userId, scheduledTime) {
  // Verify post belongs to user
  const post = await db.get(
    'SELECT id FROM posts WHERE id = ? AND user_id = ?',
    [postId, userId]
  );

  if (!post) {
    throw new Error('Post not found or access denied');
  }

  // Update post with scheduled time and status
  const result = await db.run(
    `UPDATE posts SET status = 'scheduled', scheduled_time = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [scheduledTime, postId]
  );

  return result;
}

/**
 * Publish a post manually
 */
async function publishPost(postId, userId) {
  // Verify post belongs to user
  const post = await db.get(
    'SELECT id FROM posts WHERE id = ? AND user_id = ?',
    [postId, userId]
  );

  if (!post) {
    throw new Error('Post not found or access denied');
  }

  // Update post status to published
  const result = await db.run(
    `UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [postId]
  );

  return result;
}

/**
 * Get post for editing
 */
async function getPostForEdit(postId, userId) {
  const post = await db.get(
    'SELECT * FROM posts WHERE id = ? AND user_id = ?',
    [postId, userId]
  );
  return post;
}

/**
 * Update a post
 */
async function updatePost(postId, userId, title, content, status, scheduledTime, imagePath) {
  // Verify post belongs to user
  const post = await db.get(
    'SELECT * FROM posts WHERE id = ? AND user_id = ?',
    [postId, userId]
  );

  if (!post) {
    throw new Error('Post not found or access denied');
  }

  // Use provided imagePath or keep existing
  const finalImagePath = imagePath !== undefined ? imagePath : post.image_path;

  // Update post with new values
  const result = await db.run(
    `UPDATE posts 
     SET title = ?, 
         content = ?, 
         status = ?,
         scheduled_time = CASE 
           WHEN ? = 'scheduled' THEN ?
           ELSE NULL
         END,
         published_at = CASE 
           WHEN ? = 'published' THEN CURRENT_TIMESTAMP
           ELSE published_at
         END,
         image_path = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      title || null,
      content,
      status,
      status,
      status === 'scheduled' ? scheduledTime : null,
      status,
      finalImagePath,
      postId,
    ]
  );

  return result;
}

/**
 * Delete a post
 */
async function deletePost(postId, userId) {
  // Verify post belongs to user
  const post = await db.get(
    'SELECT id FROM posts WHERE id = ? AND user_id = ?',
    [postId, userId]
  );

  if (!post) {
    throw new Error('Post not found or access denied');
  }

  const result = await db.run('DELETE FROM posts WHERE id = ?', [postId]);
  return result;
}

/**
 * Auto-publish scheduled posts (called by scheduler)
 */
async function autoPublishScheduledPosts() {
  const result = await db.run(
    `UPDATE posts SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE status = 'scheduled' AND scheduled_time <= CURRENT_TIMESTAMP`
  );
  return result;
}

module.exports = {
  createPost,
  getDraftPosts,
  getScheduledAndPublishedPosts,
  getPostById,
  schedulePost,
  publishPost,
  getPostForEdit,
  updatePost,
  deletePost,
  autoPublishScheduledPosts,
};

/**
 * Posts Module Routes
 * SMMS-F-005: Create post
 * SMMS-F-006: Upload image
 * SMMS-F-007: Save draft
 * SMMS-F-008: Schedule post
 * SMMS-F-010: View scheduled posts
 * SMMS-F-011: View published posts
 * SMMS-F-012: Edit/delete posts
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('../../shared/logging/logger');
const sanitizer = require('../../shared/security/sanitizer');
const upload = require('./upload');
const validators = require('./validators');
const models = require('./models');
const config = require('./config');

const router = express.Router();

/**
 * Error handling middleware for multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof upload.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).render('posts/create-post', {
        errors: [{ msg: 'File size too large. Maximum size is 5MB.' }]
      });
    }
    return res.status(400).render('posts/create-post', {
      errors: [{ msg: `Upload error: ${err.message}` }]
    });
  }
  if (err) {
    return res.status(400).render('posts/create-post', {
      errors: [{ msg: err.message }]
    });
  }
  next();
};

/**
 * GET /posts/create - Display post creation form
 */
router.get('/create', (req, res) => {
  res.render('posts/create-post', { errors: [] });
});

/**
 * POST /posts/create - Create a new post
 * SMMS-F-005: Create post
 * SMMS-F-006: Upload image
 * SMMS-SR-003: Input validation for XSS prevention
 */
router.post(
  '/create',
  upload.single('image'),
  handleMulterError,
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.render('posts/create-post', {
        errors: [{ msg: req.fileValidationError }]
      });
    }
    next();
  },
  validators.createPostValidation,
  async (req, res) => {
    const errors = validators.getValidationErrors(req);
    if (!errors.isEmpty()) {
      logger.warn('Post creation validation failed', {
        userId: req.session.userId,
        errors: errors.array(),
      });
      return res.render('posts/create-post', { errors: errors.array() });
    }

    try {
      const { title, content, saveAs } = req.body;
      const imagePath = req.file ? `${config.urlPath}/${req.file.filename}` : null;
      const status = saveAs === 'draft' ? 'draft' : 'published';

      // Additional file validation if image uploaded
      if (req.file) {
        const fileValidation = sanitizer.validateFileUpload(req.file);
        if (!fileValidation.valid) {
          logger.security('Invalid file upload attempt', {
            userId: req.session.userId,
            error: fileValidation.error,
            fileName: req.file.originalname,
          });
          return res.render('posts/create-post', {
            errors: [{ msg: fileValidation.error }],
          });
        }
      }

      const result = await models.createPost(req.session.userId, title || null, content, imagePath, status);

      logger.info('Post created', {
        userId: req.session.userId,
        postId: result.lastID,
        status,
        hasImage: !!imagePath,
      });

      req.session.success_msg = `Post ${status === 'draft' ? 'saved as draft' : 'created'} successfully!`;
      res.redirect('/dashboard?created=true');
    } catch (err) {
      logger.error('Post creation error', { error: err.message, userId: req.session.userId });
      res.render('posts/create-post', {
        errors: [{ msg: 'An error occurred while creating the post.' }],
      });
    }
  }
);

/**
 * GET /posts/drafts - View draft posts
 * SMMS-F-007: Save drafts
 */
router.get('/drafts', async (req, res) => {
  try {
    const posts = await models.getDraftPosts(req.session.userId);
    res.render('posts/draft-posts', { posts });
  } catch (err) {
    logger.error('Error fetching drafts', { error: err.message });
    res.status(500).render('error', { message: 'Failed to fetch draft posts.' });
  }
});

/**
 * GET /posts/scheduled - View scheduled posts
 * SMMS-F-008: Schedule posts
 * SMMS-F-010: View scheduled posts
 */
router.get('/scheduled', async (req, res) => {
  try {
    const posts = await models.getScheduledAndPublishedPosts(req.session.userId);
    res.render('posts/scheduled-posts', { posts });
  } catch (err) {
    logger.error('Error fetching scheduled posts', { error: err.message });
    res.status(500).render('error', {
      message: 'Failed to fetch scheduled posts.',
    });
  }
});

/**
 * GET /posts/:postId - View a single post
 */
router.get('/:postId', async (req, res) => {
  try {
    const post = await models.getPostById(req.params.postId, req.session.userId);

    if (!post) {
      return res.status(404).render('error', {
        message: 'Post not found or you don\'t have permission to view it.'
      });
    }

    res.render('posts/view-post', { post, userId: req.session.userId });
  } catch (err) {
    logger.error('Error fetching post', { error: err.message });
    res.status(500).render('error', {
      message: 'Failed to fetch post details.'
    });
  }
});

/**
 * POST /posts/schedule - Schedule a post
 * SMMS-F-008: Schedule posts
 */
router.post('/schedule', validators.schedulePostValidation, async (req, res) => {
  const errors = validators.getValidationErrors(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
  }

  try {
    const { postId, scheduledTime } = req.body;
    await models.schedulePost(postId, req.session.userId, scheduledTime);
    res.json({ success: true, message: 'Post scheduled successfully.' });
  } catch (err) {
    logger.error('Post scheduling error', { error: err.message });
    res.status(500).json({ error: 'Failed to schedule post.' });
  }
});

/**
 * POST /posts/publish - Manually publish a scheduled post
 * SMMS-F-009: Auto-publish (can be triggered manually)
 */
router.post('/publish', validators.publishPostValidation, async (req, res) => {
  const errors = validators.getValidationErrors(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
  }

  try {
    const { postId } = req.body;
    await models.publishPost(postId, req.session.userId);
    res.json({ success: true, message: 'Post published successfully.' });
  } catch (err) {
    logger.error('Post publishing error', { error: err.message });
    res.status(500).json({ error: 'Failed to publish post.' });
  }
});

/**
 * GET /posts/edit/:postId - Display edit form
 */
router.get('/edit/:postId', async (req, res) => {
  try {
    const post = await models.getPostForEdit(req.params.postId, req.session.userId);

    if (!post) {
      return res.status(404).render('error', {
        message: 'Post not found or you don\'t have permission to edit it.'
      });
    }

    res.render('posts/edit-post', { errors: [], post });
  } catch (err) {
    logger.error('Error fetching post for edit', { error: err.message });
    res.status(500).render('error', {
      message: 'Failed to fetch post for editing.'
    });
  }
});

/**
 * POST /posts/edit/:postId - Save edited post
 * SMMS-F-012: Edit posts
 */
router.post(
  '/edit/:postId',
  upload.single('image'),
  handleMulterError,
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.render('posts/edit-post', {
        errors: [{ msg: req.fileValidationError }],
        post: req.body
      });
    }
    next();
  },
  validators.editPostValidation,
  async (req, res) => {
    const errors = validators.getValidationErrors(req);
    if (!errors.isEmpty()) {
      const post = await models.getPostForEdit(req.params.postId, req.session.userId);
      return res.render('posts/edit-post', {
        errors: errors.array(),
        post: { ...post, ...req.body }
      });
    }

    try {
      const { postId } = req.params;
      const { title, content, status, scheduledTime, removeImage } = req.body;

      // Get current post to preserve image if not changed
      const post = await models.getPostForEdit(postId, req.session.userId);

      if (!post) {
        return res.status(403).render('error', {
          message: 'Post not found or access denied.',
        });
      }

      // Handle image upload or removal
      let imagePath = post.image_path;
      if (req.file) {
        imagePath = `${config.urlPath}/${req.file.filename}`;
      } else if (removeImage === 'true') {
        imagePath = null;
      }

      // Update post
      await models.updatePost(postId, req.session.userId, title || null, content, status, scheduledTime, imagePath);

      logger.info('Post updated', { userId: req.session.userId, postId });
      res.redirect('/posts/scheduled?updated=true');
    } catch (err) {
      logger.error('Post editing error', { error: err.message });
      const post = await models.getPostForEdit(req.params.postId, req.session.userId);
      res.render('posts/edit-post', {
        errors: [{ msg: 'Failed to edit post.' }],
        post: { ...post, ...req.body }
      });
    }
  }
);

/**
 * DELETE /posts/:postId - Delete a post
 * SMMS-F-012: Delete scheduled posts
 */
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    await models.deletePost(postId, req.session.userId);

    logger.info('Post deleted', { userId: req.session.userId, postId });
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    logger.error('Post deletion error', { error: err.message });
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

/**
 * POST /posts/auto-publish - Auto-publish scheduled posts
 * SMMS-F-009: Auto-publish triggered by admin or scheduler
 */
router.post('/auto-publish', async (req, res) => {
  try {
    const result = await models.autoPublishScheduledPosts();

    res.json({
      success: true,
      message: `${result.changes} posts auto-published.`,
      postsPublished: result.changes,
    });
  } catch (err) {
    logger.error('Auto-publish error', { error: err.message });
    res.status(500).json({ error: 'Failed to auto-publish posts.' });
  }
});

module.exports = router;

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

// Mock dependencies
jest.mock('../features/posts/models');
jest.mock('../features/posts/upload', () => ({
    single: () => (req, res, next) => next(),
    MulterError: class MulterError extends Error { }
}));
jest.mock('../features/posts/validators', () => ({
    createPostValidation: [],
    editPostValidation: [],
    schedulePostValidation: [],
    publishPostValidation: [],
    getValidationErrors: () => ({ isEmpty: () => true, array: () => [] })
}));
jest.mock('../shared/security/sanitizer', () => ({
    validateFileUpload: () => ({ valid: true })
}));

const models = require('../features/posts/models');
const postsRoutes = require('../features/posts/routes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use((req, res, next) => {
    req.session.userId = 1; // Mock logged in user
    next();
});
app.set('view engine', 'ejs');
app.use('/posts', postsRoutes);

describe('Posts Routes Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /posts/create', () => {
        it('should handle creation error', async () => {
            models.createPost.mockRejectedValue(new Error('Creation failed'));

            const res = await request(app)
                .post('/posts/create')
                .send({ title: 'Test', content: 'Content', saveAs: 'draft' });

            expect(res.text).toContain('An error occurred while creating the post');
        });

        it('should handle validation error', async () => {
            const validators = require('../features/posts/validators');
            validators.getValidationErrors = () => ({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid' }]
            });

            const res = await request(app)
                .post('/posts/create')
                .send({ title: 'Test' });

            expect(res.text).toContain('Invalid');

            // Reset mock
            validators.getValidationErrors = () => ({ isEmpty: () => true, array: () => [] });
        });
    });

    describe('GET /posts/drafts', () => {
        it('should handle fetch error', async () => {
            models.getDraftPosts.mockRejectedValue(new Error('Fetch failed'));
            const res = await request(app).get('/posts/drafts');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /posts/scheduled', () => {
        it('should handle fetch error', async () => {
            models.getScheduledAndPublishedPosts.mockRejectedValue(new Error('Fetch failed'));
            const res = await request(app).get('/posts/scheduled');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /posts/:postId', () => {
        it('should handle not found', async () => {
            models.getPostById.mockResolvedValue(null);
            const res = await request(app).get('/posts/999');
            expect(res.status).toBe(404);
        });

        it('should handle error', async () => {
            models.getPostById.mockRejectedValue(new Error('Error'));
            const res = await request(app).get('/posts/1');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /posts/schedule', () => {
        it('should handle error', async () => {
            models.schedulePost.mockRejectedValue(new Error('Error'));
            const res = await request(app)
                .post('/posts/schedule')
                .send({ postId: 1, scheduledTime: '2025-01-01' });
            expect(res.status).toBe(500);
        });
    });

    describe('POST /posts/publish', () => {
        it('should handle error', async () => {
            models.publishPost.mockRejectedValue(new Error('Error'));
            const res = await request(app)
                .post('/posts/publish')
                .send({ postId: 1 });
            expect(res.status).toBe(500);
        });
    });

    describe('POST /posts/edit/:postId', () => {
        it('should handle update error', async () => {
            models.getPostForEdit.mockResolvedValue({ id: 1 });
            models.updatePost.mockRejectedValue(new Error('Update failed'));

            const res = await request(app)
                .post('/posts/edit/1')
                .send({ title: 'Update', content: 'Content' });

            expect(res.text).toContain('Failed to edit post');
        });

        it('should handle post not found during update', async () => {
            models.getPostForEdit.mockResolvedValue(null);
            const res = await request(app)
                .post('/posts/edit/1')
                .send({ title: 'Update' });
            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /posts/:postId', () => {
        it('should handle delete error', async () => {
            models.deletePost.mockRejectedValue(new Error('Delete failed'));
            const res = await request(app).delete('/posts/1');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /posts/auto-publish', () => {
        it('should handle error', async () => {
            models.autoPublishScheduledPosts.mockRejectedValue(new Error('Error'));
            const res = await request(app).post('/posts/auto-publish');
            expect(res.status).toBe(500);
        });

        it('should succeed', async () => {
            models.autoPublishScheduledPosts.mockResolvedValue({ changes: 1 });
            const res = await request(app).post('/posts/auto-publish');
            expect(res.body.success).toBe(true);
        });
    });
});

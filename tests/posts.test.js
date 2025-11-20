const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Post Endpoints', () => {
    let agent;

    beforeEach(async () => {
        agent = request.agent(app);

        // Register and login
        await agent
            .post('/auth/register')
            .send({
                email: 'poster@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });

        await agent
            .post('/auth/login')
            .send({
                email: 'poster@example.com',
                password: 'Password123!'
            });
    });

    describe('Post Operations', () => {
        it('should create a new post', async () => {
            const res = await agent
                .post('/posts/create')
                .send({
                    title: 'Test Post',
                    content: 'Hello World',
                    platforms: ['twitter'],
                    saveAs: 'published'
                });

            expect(res.statusCode).toEqual(302);

            const post = await db.get('SELECT * FROM posts WHERE content = ?', ['Hello World']);
            expect(post).toBeTruthy();
            expect(post.content).toBe('Hello World');
            expect(post.status).toBe('published');
        });

        it('should save as draft', async () => {
            const res = await agent
                .post('/posts/create')
                .send({
                    title: 'Draft Post',
                    content: 'Draft Content',
                    saveAs: 'draft'
                });

            expect(res.statusCode).toEqual(302);
            const post = await db.get('SELECT * FROM posts WHERE content = ?', ['Draft Content']);
            expect(post.status).toBe('draft');
        });

        it('should list drafts', async () => {
            await agent.post('/posts/create').send({ content: 'Draft 1', saveAs: 'draft' });
            const res = await agent.get('/posts/drafts');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('Draft 1');
        });

        it('should delete a post', async () => {
            // Create post first
            await agent.post('/posts/create').send({ content: 'To Delete', saveAs: 'draft' });
            const post = await db.get('SELECT id FROM posts WHERE content = ?', ['To Delete']);

            const res = await agent.delete(`/posts/${post.id}`);
            expect(res.statusCode).toEqual(200);

            const deleted = await db.get('SELECT * FROM posts WHERE id = ?', [post.id]);
            expect(deleted).toBeFalsy();
        });

        it('should edit a post', async () => {
            // Create post
            await agent.post('/posts/create').send({ content: 'Original', saveAs: 'draft' });
            const post = await db.get('SELECT id FROM posts WHERE content = ?', ['Original']);

            const res = await agent
                .post(`/posts/edit/${post.id}`)
                .send({
                    content: 'Updated',
                    status: 'draft'
                });

            expect(res.statusCode).toEqual(302);
            const updated = await db.get('SELECT * FROM posts WHERE id = ?', [post.id]);
            expect(updated.content).toBe('Updated');
        });
    });

    describe('GET /dashboard', () => {
        it('should display dashboard', async () => {
            const res = await agent.get('/dashboard');
            expect(res.statusCode).toEqual(200);
        });
    });
});

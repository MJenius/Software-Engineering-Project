const db = require('../database');
const postModels = require('../features/posts/models');
const userModels = require('../features/admin/users');

describe('Unit Tests', () => {
    let userId;
    let adminId;

    beforeAll(async () => {
        // Seed users
        const userRes = await db.run("INSERT INTO users (email, password_hash, role, is_active) VALUES ('unit@test.com', 'hash', 'user', 1)");
        userId = userRes.lastID;

        const adminRes = await db.run("INSERT INTO users (email, password_hash, role, is_active) VALUES ('admin@unit.com', 'hash', 'admin', 1)");
        adminId = adminRes.lastID;
    });

    describe('Post Models', () => {
        let postId;

        it('should create a post', async () => {
            const res = await postModels.createPost(userId, 'Title', 'Content', null, 'draft');
            postId = res.lastID;
            expect(postId).toBeTruthy();
        });

        it('should get draft posts', async () => {
            const posts = await postModels.getDraftPosts(userId);
            expect(posts.length).toBeGreaterThan(0);
            expect(posts[0].status).toBe('draft');
        });

        it('should get scheduled posts', async () => {
            await postModels.createPost(userId, 'Scheduled', 'Content', null, 'scheduled');
            const posts = await postModels.getScheduledAndPublishedPosts(userId);
            expect(posts.length).toBeGreaterThan(0);
        });

        it('should get post by id', async () => {
            const post = await postModels.getPostById(postId, userId);
            expect(post).toBeTruthy();
            expect(post.id).toBe(postId);
        });

        it('should update a post', async () => {
            await postModels.updatePost(postId, userId, 'Updated Title', 'Updated Content', 'draft', null, null);
            const post = await postModels.getPostById(postId, userId);
            expect(post.title).toBe('Updated Title');
        });

        it('should schedule a post', async () => {
            const time = '2025-12-31T12:00:00';
            await postModels.schedulePost(postId, userId, time);
            const post = await postModels.getPostForEdit(postId, userId);
            expect(post.status).toBe('scheduled');
        });

        it('should publish a post', async () => {
            await postModels.publishPost(postId, userId);
            const post = await postModels.getPostForEdit(postId, userId);
            expect(post.status).toBe('published');
        });

        it('should delete a post', async () => {
            await postModels.deletePost(postId, userId);
            const post = await postModels.getPostForEdit(postId, userId);
            expect(post).toBeFalsy();
        });

        it('should handle database errors gracefully', async () => {
            const originalRun = db.run;
            db.run = jest.fn().mockRejectedValue(new Error('DB Error'));
            await expect(postModels.createPost(userId, 'Title', 'Content', null, 'draft'))
                .rejects.toThrow('DB Error');
            db.run = originalRun;
        });
    });

    describe('User Models', () => {
        let targetUserId;

        beforeAll(async () => {
            const res = await db.run("INSERT INTO users (email, password_hash, role, is_active) VALUES ('target@test.com', 'hash', 'user', 1)");
            targetUserId = res.lastID;
        });

        it('should get all users', async () => {
            const users = await userModels.getAllUsers();
            expect(users.length).toBeGreaterThan(0);
        });

        it('should get system stats', async () => {
            const stats = await userModels.getSystemStats();
            expect(stats).toHaveProperty('totalUsers');
        });

        it('should deactivate user', async () => {
            await userModels.deactivateUser(targetUserId, adminId);
            const user = await db.get('SELECT is_active FROM users WHERE id = ?', [targetUserId]);
            expect(user.is_active).toBe(0);
        });

        it('should activate user', async () => {
            await userModels.activateUser(targetUserId, adminId);
            const user = await db.get('SELECT is_active FROM users WHERE id = ?', [targetUserId]);
            expect(user.is_active).toBe(1);
        });

        it('should promote to admin', async () => {
            await userModels.promoteToAdmin(targetUserId);
            const user = await db.get('SELECT role FROM users WHERE id = ?', [targetUserId]);
            expect(user.role).toBe('admin');
        });

        it('should demote from admin', async () => {
            await userModels.demoteFromAdmin(targetUserId, adminId);
            const user = await db.get('SELECT role FROM users WHERE id = ?', [targetUserId]);
            expect(user.role).toBe('user');
        });

        it('should prevent self-deactivation', async () => {
            await expect(userModels.deactivateUser(adminId, adminId))
                .rejects.toThrow('Cannot deactivate your own account');
        });

        it('should prevent self-demotion', async () => {
            await expect(userModels.demoteFromAdmin(adminId, adminId))
                .rejects.toThrow('Cannot demote your own account');
        });

        it('should get user posts', async () => {
            const result = await userModels.getUserPosts(userId);
            expect(result.user).toBeTruthy();
            expect(Array.isArray(result.posts)).toBe(true);
        });
    });
});

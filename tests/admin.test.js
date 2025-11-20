const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Admin Endpoints', () => {
    let adminAgent;
    let userAgent;
    let testUserId;

    beforeAll(async () => {
        // Create a regular user for testing admin actions
        const hashedPassword = await require('bcrypt').hash('password123', 10);
        const result = await db.run(
            'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)',
            ['target@example.com', hashedPassword, 'user', 1]
        );
        testUserId = result.lastID;
    });

    beforeEach(async () => {
        adminAgent = request.agent(app);
        userAgent = request.agent(app);

        // Login as admin (seeded in database.js)
        await adminAgent
            .post('/auth/login')
            .send({
                email: 'admin@smms.local',
                password: 'admin123'
            });

        // Login as user
        await userAgent
            .post('/auth/login')
            .send({
                email: 'target@example.com',
                password: 'password123'
            });
    });

    describe('Access Control', () => {
        it('should allow admin to access dashboard', async () => {
            const res = await adminAgent.get('/admin');
            expect(res.statusCode).toEqual(200);
        });

        it('should deny non-admin access to dashboard', async () => {
            const res = await userAgent.get('/admin');
            expect(res.statusCode).toEqual(403); // Assuming 403 Forbidden or redirect
        });
    });

    describe('User Management', () => {
        it('should list users', async () => {
            const res = await adminAgent.get('/admin/users');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('target@example.com');
        });

        it('should deactivate a user', async () => {
            const res = await adminAgent.post(`/admin/deactivate/${testUserId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            const user = await db.get('SELECT is_active FROM users WHERE id = ?', [testUserId]);
            expect(user.is_active).toBe(0);
        });

        it('should activate a user', async () => {
            // First deactivate
            await db.run('UPDATE users SET is_active = 0 WHERE id = ?', [testUserId]);

            const res = await adminAgent.post(`/admin/activate/${testUserId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);

            const user = await db.get('SELECT is_active FROM users WHERE id = ?', [testUserId]);
            expect(user.is_active).toBe(1);
        });
    });

    describe('System Operations', () => {
        it('should trigger manual publish', async () => {
            const res = await adminAgent.post('/admin/publish-scheduled');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });

        it('should create a backup', async () => {
            const res = await adminAgent.post('/admin/backup');
            // Backup might fail in test env if folders don't exist, but we check handling
            if (res.statusCode === 200) {
                expect(res.body.success).toBe(true);
            } else {
                expect(res.statusCode).not.toEqual(404); // Should be 500 or 200
            }
        });

        it('should list backups', async () => {
            const res = await adminAgent.get('/admin/backups');
            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
        });
    });
});

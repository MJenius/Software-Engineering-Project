const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Auth Endpoints', () => {
    describe('GET /auth/register', () => {
        it('should return 200 OK', async () => {
            const res = await request(app).get('/auth/register');
            if (res.statusCode !== 200) console.log(res.text);
            expect(res.statusCode).toEqual(200);
        });
    });

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            if (res.statusCode !== 302) console.log(res.text);
            expect(res.statusCode).toEqual(302); // Redirects to login
            expect(res.header.location).toBe('/auth/login');

            const user = await db.get('SELECT * FROM users WHERE email = ?', ['test@example.com']);
            expect(user).toBeTruthy();
            expect(user.role).toBe('user');
        });

        it('should fail with existing email', async () => {
            // First registration
            await request(app)
                .post('/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            // Second registration
            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });

            expect(res.text).toContain('Email already registered');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'Password123!'
                });

            if (res.statusCode !== 302) console.log(res.text);
            expect(res.statusCode).toEqual(302);
            expect(res.header.location).toBe('/dashboard');
            expect(res.header['set-cookie']).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'WrongPassword123!'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.text).toContain('Invalid email or password');
        });
    });
});

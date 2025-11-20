const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

// Mock dependencies
jest.mock('../features/admin/users');
jest.mock('../features/admin/backup');

const userModels = require('../features/admin/users');
const backupModels = require('../features/admin/backup');
const adminRoutes = require('../features/admin/routes');

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use((req, res, next) => {
    req.session.userId = 1;
    req.session.userRole = 'admin';
    next();
});
app.set('view engine', 'ejs');
app.use('/admin', adminRoutes);

describe('Admin Routes Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /admin', () => {
        it('should handle error', async () => {
            userModels.getAllUsers.mockRejectedValue(new Error('Error'));
            const res = await request(app).get('/admin');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /admin/deactivate/:userId', () => {
        it('should handle error', async () => {
            userModels.deactivateUser.mockRejectedValue(new Error('Error'));
            const res = await request(app).post('/admin/deactivate/2');
            expect(res.status).toBe(400);
        });
    });

    describe('POST /admin/activate/:userId', () => {
        it('should handle error', async () => {
            userModels.activateUser.mockRejectedValue(new Error('Error'));
            const res = await request(app).post('/admin/activate/2');
            expect(res.status).toBe(400);
        });
    });

    describe('POST /admin/promote/:userId', () => {
        it('should handle error', async () => {
            userModels.promoteToAdmin.mockRejectedValue(new Error('Error'));
            const res = await request(app).post('/admin/promote/2');
            expect(res.status).toBe(400);
        });
    });

    describe('POST /admin/demote/:userId', () => {
        it('should handle error', async () => {
            userModels.demoteFromAdmin.mockRejectedValue(new Error('Error'));
            const res = await request(app).post('/admin/demote/2');
            expect(res.status).toBe(400);
        });
    });

    describe('POST /admin/backup', () => {
        it('should handle error', async () => {
            backupModels.createBackup.mockRejectedValue(new Error('Error'));
            const res = await request(app).post('/admin/backup');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /admin/backups', () => {
        it('should handle error', async () => {
            // listBackups is synchronous in routes.js?
            // "const backups = backupModels.listBackups();"
            // So we mock it to throw
            backupModels.listBackups.mockImplementation(() => { throw new Error('Error'); });
            const res = await request(app).get('/admin/backups');
            expect(res.status).toBe(500);
        });
    });
});

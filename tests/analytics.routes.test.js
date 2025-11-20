const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Mock dependencies
jest.mock('../features/analytics/queries');
const queries = require('../features/analytics/queries');
const analyticsRoutes = require('../features/analytics/routes');

const app = express();
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use((req, res, next) => {
    req.session.userId = 1;
    req.session.userEmail = 'test@test.com';
    next();
});
app.set('view engine', 'ejs');
app.use('/analytics', analyticsRoutes);

describe('Analytics Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render analytics page', async () => {
        queries.getUserAnalytics.mockResolvedValue({ totalPosts: 10 });
        queries.getMonthlyBreakdown.mockResolvedValue([]);

        const res = await request(app).get('/analytics');

        expect(res.status).toBe(200);
        expect(queries.getUserAnalytics).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
        queries.getUserAnalytics.mockRejectedValue(new Error('DB Error'));

        const res = await request(app).get('/analytics');

        expect(res.status).toBe(500);
    });
});

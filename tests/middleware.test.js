const middleware = require('../features/auth/middleware');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { session: {}, path: '/' };
        res = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            render: jest.fn(),
            locals: {}
        };
        next = jest.fn();
    });

    describe('isAuthenticated', () => {
        it('should call next if user is logged in and session is valid', () => {
            req.session.userId = 1;
            req.session.lastActivity = Date.now();
            middleware.isAuthenticated(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should redirect to login if not logged in', () => {
            middleware.isAuthenticated(req, res, next);
            expect(res.redirect).toHaveBeenCalledWith('/auth/login');
        });

        it('should redirect if session expired', () => {
            req.session.userId = 1;
            req.session.lastActivity = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
            req.session.destroy = jest.fn();

            middleware.isAuthenticated(req, res, next);

            expect(req.session.destroy).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith('/auth/login');
        });
    });

    describe('isAdmin', () => {
        it('should call next if user is admin', () => {
            req.session.userId = 1;
            req.session.userRole = 'admin';
            middleware.isAdmin(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should deny access if user is not admin', () => {
            req.session.userId = 1;
            req.session.userRole = 'user';
            middleware.isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.render).toHaveBeenCalled();
        });

        it('should deny access if not logged in', () => {
            middleware.isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});

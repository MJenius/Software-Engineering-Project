const db = require('../database');
const publishers = require('../features/scheduler/publishers');

// Mock db
jest.mock('../database');
jest.mock('../shared/logging/logger');

describe('Publishers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should publish scheduled posts', async () => {
        // Mock scheduled posts
        db.all.mockResolvedValue([
            { id: 1, title: 'Post 1', scheduled_time: '2020-01-01T00:00:00', status: 'scheduled' }
        ]);

        // Mock update result
        db.run.mockResolvedValue({ changes: 1 });

        const result = await publishers.publishScheduledPosts();

        expect(db.all).toHaveBeenCalled();
        expect(db.run).toHaveBeenCalled();
        expect(result.changes).toBe(1);
    });

    it('should handle no scheduled posts', async () => {
        db.all.mockResolvedValue([]);
        db.run.mockResolvedValue({ changes: 0 });

        const result = await publishers.publishScheduledPosts();

        expect(result.changes).toBe(0);
    });

    it('should handle database error during fetch', async () => {
        db.all.mockRejectedValue(new Error('DB Error'));

        await expect(publishers.publishScheduledPosts())
            .rejects.toThrow('DB Error');
    });

    it('should handle database error during update', async () => {
        db.all.mockResolvedValue([{ id: 1 }]);
        db.run.mockRejectedValue(new Error('Update Error'));

        await expect(publishers.publishScheduledPosts())
            .rejects.toThrow('Update Error');
    });
});

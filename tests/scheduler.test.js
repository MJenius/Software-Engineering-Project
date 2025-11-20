const scheduler = require('../features/scheduler');
const db = require('../database');

describe('Scheduler', () => {
    beforeAll(async () => {
        await db.initialize();
    });

    afterAll(async () => {
        await db.close();
    });

    it('should start scheduler', () => {
        jest.useFakeTimers();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        scheduler.startScheduler();

        jest.advanceTimersByTime(60000); // Advance 1 minute
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
        jest.useRealTimers();
    });
});

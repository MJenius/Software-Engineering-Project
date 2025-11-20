const db = require('../database');
const backupModels = require('../features/admin/backup');
const analyticsQueries = require('../features/analytics/queries');
const scheduler = require('../features/scheduler');
const publishers = require('../features/scheduler/publishers');
const backupUtil = require('../utils/backup');
const config = require('../features/scheduler/config');

// Mock dependencies
jest.mock('../utils/backup');
jest.mock('../features/scheduler/publishers');

describe('Additional Unit Tests', () => {
    beforeAll(async () => {
        await db.initialize();
        // Seed data for analytics
        await db.run("INSERT INTO users (email, password_hash, role, is_active) VALUES ('analytics@test.com', 'hash', 'user', 1)");
        const user = await db.get("SELECT id FROM users WHERE email = 'analytics@test.com'");
        await db.run("INSERT INTO posts (user_id, title, content, status) VALUES (?, 'P1', 'C1', 'published')", [user.id]);
        await db.run("INSERT INTO posts (user_id, title, content, status) VALUES (?, 'P2', 'C2', 'draft')", [user.id]);
    });

    afterAll(async () => {
        await db.close();
    });

    describe('Backup Models', () => {
        it('should create backup successfully', async () => {
            backupUtil.createBackup.mockResolvedValue({
                success: true,
                fileName: 'backup.sqlite',
                size: 1024,
                timestamp: new Date()
            });

            const result = await backupModels.createBackup(1);
            expect(result.success).toBe(true);
            expect(result.fileName).toBe('backup.sqlite');
        });

        it('should handle backup failure', async () => {
            backupUtil.createBackup.mockResolvedValue({
                success: false,
                error: 'Backup failed'
            });

            await expect(backupModels.createBackup(1))
                .rejects.toThrow('Backup failed');
        });

        it('should handle backup exception', async () => {
            backupUtil.createBackup.mockRejectedValue(new Error('System error'));
            await expect(backupModels.createBackup(1))
                .rejects.toThrow('System error');
        });

        it('should list backups', () => {
            backupUtil.listBackups.mockReturnValue(['backup1.sqlite']);
            const backups = backupModels.listBackups();
            expect(backups).toContain('backup1.sqlite');
        });

        it('should delete backup', () => {
            backupUtil.deleteBackup.mockReturnValue({ success: true });
            const result = backupModels.deleteBackup('backup.sqlite', 1);
            expect(result.success).toBe(true);
        });

        it('should prevent path traversal in delete', () => {
            expect(() => backupModels.deleteBackup('../backup.sqlite', 1))
                .toThrow('Invalid file name');
        });

        it('should get backup file path', () => {
            backupUtil.BACKUP_DIR = '/backups';
            const path = backupModels.getBackupFilePath('backup.sqlite', 1);
            expect(path).toContain('backup.sqlite');
        });

        it('should prevent path traversal in get path', () => {
            expect(() => backupModels.getBackupFilePath('../backup.sqlite', 1))
                .toThrow('Invalid file name');
        });
    });

    describe('Analytics Queries', () => {
        it('should get user analytics', async () => {
            const user = await db.get("SELECT id FROM users WHERE email = 'analytics@test.com'");
            const analytics = await analyticsQueries.getUserAnalytics(user.id);
            expect(analytics.totalPosts).toBe(2);
            expect(analytics.publishedPosts).toBe(1);
            expect(analytics.draftPosts).toBe(1);
        });

        it('should get monthly breakdown', async () => {
            const user = await db.get("SELECT id FROM users WHERE email = 'analytics@test.com'");
            const breakdown = await analyticsQueries.getMonthlyBreakdown(user.id);
            expect(Array.isArray(breakdown)).toBe(true);
        });
    });

    describe('Scheduler', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.spyOn(console, 'log').mockImplementation();
            jest.spyOn(console, 'error').mockImplementation();
            scheduler.stopScheduler();
        });

        afterEach(() => {
            jest.useRealTimers();
            jest.restoreAllMocks();
        });

        it('should not start if disabled', () => {
            const originalEnabled = config.enabled;
            config.enabled = false;
            scheduler.startScheduler();
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('disabled'));
            config.enabled = originalEnabled;
        });

        it('should start scheduler', () => {
            scheduler.startScheduler();
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Started'));
        });

        it('should not start if already running', () => {
            scheduler.startScheduler();
            scheduler.startScheduler();
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already running'));
        });

        it('should stop scheduler', () => {
            scheduler.startScheduler();
            scheduler.stopScheduler();
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Stopped'));
        });

        it('should trigger publish', async () => {
            publishers.publishScheduledPosts.mockResolvedValue({ changes: 1 });
            const result = await scheduler.triggerPublish();
            expect(result.changes).toBe(1);
        });

        it('should handle trigger error', async () => {
            publishers.publishScheduledPosts.mockRejectedValue(new Error('Publish failed'));
            await expect(scheduler.triggerPublish()).rejects.toThrow('Publish failed');
        });

        it('should run scheduled task', () => {
            scheduler.startScheduler();
            jest.advanceTimersByTime(config.interval + 100);
            expect(publishers.publishScheduledPosts).toHaveBeenCalled();
        });
    });
});

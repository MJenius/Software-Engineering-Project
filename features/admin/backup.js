/**
 * Admin Module - Backup Management Models
 * SMMS-NF-005: Manual database backup
 */

const backup = require('../../utils/backup');
const logger = require('../../shared/logging/logger');

/**
 * Create database backup
 */
async function createBackup(adminId) {
  try {
    logger.info('Database backup initiated', { adminId });
    const result = await backup.createBackup();

    if (result.success) {
      logger.info('Database backup created successfully', {
        adminId,
        fileName: result.fileName,
        size: result.size,
      });
      return {
        success: true,
        message: 'Database backup created successfully.',
        fileName: result.fileName,
        size: result.size,
        timestamp: result.timestamp,
      };
    } else {
      logger.error('Database backup failed', { adminId, error: result.error });
      throw new Error(result.error || 'Failed to create backup');
    }
  } catch (err) {
    logger.error('Backup error', { error: err.message, adminId });
    throw err;
  }
}

/**
 * List all backups
 */
function listBackups() {
  return backup.listBackups();
}

/**
 * Delete a backup file
 */
function deleteBackup(fileName, adminId) {
  // Security check: ensure filename doesn't contain path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    logger.security('Attempted path traversal in backup deletion', {
      adminId,
      fileName,
    });
    throw new Error('Invalid file name');
  }

  const result = backup.deleteBackup(fileName);

  if (result.success) {
    logger.info('Backup file deleted', { adminId, fileName });
  }

  return result;
}

/**
 * Download a backup file path
 */
function getBackupFilePath(fileName, adminId) {
  // Security check: ensure filename doesn't contain path traversal
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    logger.security('Attempted path traversal in backup download', {
      adminId,
      fileName,
    });
    throw new Error('Invalid file name');
  }

  const path = require('path');
  return path.join(backup.BACKUP_DIR, fileName);
}

module.exports = {
  createBackup,
  listBackups,
  deleteBackup,
  getBackupFilePath,
};

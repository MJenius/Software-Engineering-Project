/**
 * Logger utility for SMMS
 * Provides structured logging for authentication, posts, and system events
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'smms.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');
const AUTH_LOG_FILE = path.join(LOG_DIR, 'auth.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Format log entry with timestamp
 */
function formatLogEntry(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
}

/**
 * Write to log file
 */
function writeLog(file, entry) {
  try {
    fs.appendFileSync(file, entry, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

/**
 * Log levels
 */
const logger = {
  info: (message, meta = {}) => {
    const entry = formatLogEntry('INFO', message, meta);
    console.log(entry.trim());
    writeLog(LOG_FILE, entry);
  },

  error: (message, meta = {}) => {
    const entry = formatLogEntry('ERROR', message, meta);
    console.error(entry.trim());
    writeLog(LOG_FILE, entry);
    writeLog(ERROR_LOG_FILE, entry);
  },

  warn: (message, meta = {}) => {
    const entry = formatLogEntry('WARN', message, meta);
    console.warn(entry.trim());
    writeLog(LOG_FILE, entry);
  },

  auth: (message, meta = {}) => {
    const entry = formatLogEntry('AUTH', message, meta);
    console.log(entry.trim());
    writeLog(LOG_FILE, entry);
    writeLog(AUTH_LOG_FILE, entry);
  },

  security: (message, meta = {}) => {
    const entry = formatLogEntry('SECURITY', message, meta);
    console.warn(entry.trim());
    writeLog(LOG_FILE, entry);
    writeLog(ERROR_LOG_FILE, entry);
  },
};

module.exports = logger;

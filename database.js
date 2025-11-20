const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, 'smms.db');
const db = new sqlite3.Database(DB_PATH);

/**
 * Initialize database tables
 */
const initialize = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Posts table
      db.run(
        `CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT,
          content TEXT NOT NULL,
          image_path TEXT,
          status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'scheduled', 'published')),
          scheduled_time DATETIME,
          published_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Sessions table (for session management)
      db.run(
        `CREATE TABLE IF NOT EXISTS sessions (
          sid TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          expiresAt INTEGER NOT NULL
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Audit log table for security events
      db.run(
        `CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
        )`,
        (err) => {
          if (err) reject(err);
        }
      );

      // Seed initial admin user if not exists
      const adminEmail = 'admin@smms.local';
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [adminEmail],
        async (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(
              'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)',
              [adminEmail, hashedPassword, 'admin', 1],
              (err) => {
                if (err) reject(err);
                else {
                  console.log('Admin user created: admin@smms.local / admin123');
                  resolve();
                }
              }
            );
          } else {
            resolve();
          }
        }
      );
    });
  });
};

/**
 * Run a query and return a promise
 */
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

/**
 * Get a single row
 */
const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Get all rows
 */
const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * Close database connection
 */
const close = () => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

module.exports = {
  db,
  initialize,
  run,
  get,
  all,
  close,
};

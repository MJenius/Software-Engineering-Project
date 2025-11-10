// src/config/database.js
// SECURITY: Database connection with parameterized queries for SQL injection prevention

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './db/smms.db';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.log('✓ Connected to SQLite database');
    }
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      is_active INTEGER DEFAULT 1
    )
  `, (err) => {
    if (err && process.env.NODE_ENV !== 'test') {
      console.error('❌ Error creating users table:', err);
    } else if (!err && process.env.NODE_ENV !== 'test') {
      console.log('✓ Users table initialized');
    }
  });
});

module.exports = db;

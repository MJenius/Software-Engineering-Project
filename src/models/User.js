// src/models/User.js
// SECURITY: Uses parameterized queries to prevent SQL injection (SMMS-SR-002 SQL Injection Prevention)

const db = require('../config/database');

class User {
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      // SECURITY: Parameterized query prevents SQL injection
      // Email is passed as a parameter (in the array), not concatenated into the query string
      // Example attack attempt: "admin'--" is treated as a literal string, not SQL code
      db.get(
        'SELECT * FROM users WHERE email = ? AND is_active = 1',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row); // Returns user object or undefined
          }
        }
      );
    });
  }

  static updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  static create(email, passwordHash, fullName = null, role = 'user') {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
        [email, passwordHash, fullName, role],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  }
}

module.exports = User;

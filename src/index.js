// src/index.js
// Server startup

require('dotenv').config();
const app = require('./app');
require('./config/database'); // Initialize database

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ Database: ${process.env.DATABASE_PATH || './db/smms.db'}\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = server;

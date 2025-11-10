// src/routes/health.js
// Health check route for monitoring

const express = require('express');
const router = express.Router();

// GET /api/health
// Returns the server status and basic system information
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version
  });
});

module.exports = router;

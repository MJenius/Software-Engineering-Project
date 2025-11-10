// src/app.js
// Main Express application setup with security middleware

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/health');

const app = express();

// SECURITY: Middleware for security headers
app.use(helmet());

// SECURITY: CORS configuration (restrict to your frontend domain in production)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SMMS (Social Media Management System)',
    version: require('../package.json').version,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      posts: '/api/posts',
      users: '/api/users',
      analytics: '/api/analytics'
    }
  });
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    environment: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

module.exports = app;

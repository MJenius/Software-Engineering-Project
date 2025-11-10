// src/app.js
// Main Express application setup with security middleware

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

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
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports = app;

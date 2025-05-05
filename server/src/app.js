/**
 * Express Application Setup
 * 
 * This file configures the Express application with middleware,
 * routes, and other settings.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const logger = require('./utils/logger');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Compress responses
app.use(compression());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../../storage/uploads')));

// API routes
const apiRouter = express.Router();

// Auth routes
apiRouter.use('/auth', require('./api/auth'));

// Real Estate routes
apiRouter.use('/real-estate', require('./api/real-estate'));

// Mortgage routes (to be implemented)
// apiRouter.use('/mortgage', require('./api/mortgage'));

// Maintenance routes (to be implemented)
// apiRouter.use('/maintenance', require('./api/maintenance'));

// Core routes (to be implemented)
// apiRouter.use('/core', require('./api/core'));

// Mount API router
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  
  // Log error
  if (statusCode === 500) {
    logger.error('Server Error', { 
      error: err.message, 
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

module.exports = app;

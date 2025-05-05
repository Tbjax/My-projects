/**
 * Server Entry Point
 * 
 * This is the main entry point for the Modern Intranet Platform server.
 * It initializes the Express application and starts the HTTP server.
 */

require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Socket.IO setup
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('New socket connection established', { socketId: socket.id });

  // Join user to their own room for private messages
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
      logger.info('User joined their private room', { userId, socketId: socket.id });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { socketId: socket.id });
  });
});

// Make io accessible to other modules
app.set('io', io);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  // Close server & exit process
  server.close(() => process.exit(1));
});

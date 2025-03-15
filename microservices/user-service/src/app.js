const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { setupMetricsMiddleware } = require('./metrics');
const { loggingMiddleware } = require('./middlewares/logging.middleware');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { logger } = require('./utils/logger');

// Initialize express app
const app = express();

setupMetricsMiddleware(app, 'user-service');

// Apply middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Service is healthy',
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;

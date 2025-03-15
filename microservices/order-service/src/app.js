const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { setupMetricsMiddleware } = require('./metrics');

const orderRoutes = require('./routes/order.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { logger } = require('./utils/logger');

// Initialize express app
const app = express();

setupMetricsMiddleware(app, 'order-service');

// Apply middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Service is healthy',
  });
});

// API routes
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;

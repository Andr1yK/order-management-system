const { initTracer } =require('./utils/tracer');

// Initialize tracing
initTracer();

const app = require('./app');
const { logger } = require('./utils/logger');
const { connectDB } = require('./config/sequelize');

// Get port from environment or use default
const PORT = process.env.PORT || 3030;

// Connect to database then start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connection established');

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Start the server
startServer();

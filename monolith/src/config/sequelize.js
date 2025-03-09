const { Sequelize } = require('sequelize');
const { logger } = require('../utils/logger');

// Create Sequelize instance with credentials from environment variables
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development'
    ? (msg) => logger.debug(msg)
    : false,
  ssl: process.env.DB_SSL === 'true'
    ? { require: true, rejectUnauthorized: false }
    : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Function to test the database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected via Sequelize');
    return sequelize;
  } catch (error) {
    logger.error(`PostgreSQL connection error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectDB
};

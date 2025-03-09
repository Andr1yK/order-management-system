const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// Create a new Pool instance with credentials from environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Function to test the database connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('PostgreSQL connected');
    client.release();
    return pool;
  } catch (error) {
    logger.error(`PostgreSQL connection error: ${error.message}`);
    throw error;
  }
};

// Query function for executing SQL queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Executed query: ${text}`);
      logger.debug(`Duration: ${duration}ms, Rows: ${res.rowCount}`);
    }

    return res;
  } catch (error) {
    logger.error(`Query error: ${error.message}`);
    logger.error(`Query: ${text}`);
    throw error;
  }
};

module.exports = {
  pool,
  connectDB,
  query
};

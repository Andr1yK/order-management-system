const { Pool } = require('pg');
const config = require('config');
const { logger } = require('../utils/logger');

// Create a new Pool instance with credentials from environment variables
const pool = new Pool({
  host: config.get('db.host'),
  port: config.get('db.port'),
  user: config.get('db.user'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Mapping of tables to domains
const tableToDomainMap = {
  'users': 'users',
  'users_schema.users': 'users',

  'orders': 'orders',
  'orders_schema.orders': 'orders',
  'order_items': 'orders',
  'orders_schema.order_items': 'orders'
};

function detectDomain(sqlText) {
  for (const [table, domain] of Object.entries(tableToDomainMap)) {
    const tablePatterns = [
      new RegExp(`FROM\\s+${table}\\b`, 'i'),
      new RegExp(`JOIN\\s+${table}\\b`, 'i'),
      new RegExp(`UPDATE\\s+${table}\\b`, 'i'),
      new RegExp(`INTO\\s+${table}\\b`, 'i')
    ];

    if (tablePatterns.some(pattern => pattern.test(sqlText))) {
      return domain;
    }
  }

  return null;
}

function getSchema(domain) {
  const shouldUseNewSchema = process.env.USE_NEW_SCHEMA === 'true';

  if (shouldUseNewSchema) {
    if (domain === 'users') return 'users_schema';
    if (domain === 'orders') return 'orders_schema';
  }

  return 'public';
}

function applySchema(text, domain) {
  if (!domain) return text;

  const schema = getSchema(domain);

  // Table mapping for each domain
  const tableMap = {
    users: {
      users: `${schema}.users`
    },
    orders: {
      orders: `${schema}.orders`,
      order_items: `${schema}.order_items`
    }
  };

  let modifiedText = text;
  const tables = tableMap[domain] || {};

  Object.entries(tables).forEach(([tableName, fullTableName]) => {
    // RegExp for replacing table names with SQL context
    // Find tables after FROM, JOIN, UPDATE, INSERT INTO
    const regex = new RegExp(`(FROM|JOIN|INTO|UPDATE)\\s+${tableName}\\b`, 'gi');
    modifiedText = modifiedText.replace(regex, `$1 ${fullTableName}`);

    // Find standalone table names with a dot
    // For example: users.id, order_items.product_name
    const standaloneRegex = new RegExp(`\\b${tableName}\\.`, 'g');
    modifiedText = modifiedText.replace(standaloneRegex, `${fullTableName}.`);
  });

  return modifiedText;
}

const query = async (text, params = [], options = {}) => {
  const start = Date.now();

  const domain = options.domain || detectDomain(text);

  const modifiedText = applySchema(text, domain);

  try {
    const res = await pool.query(modifiedText, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Executed query (${domain || 'no domain'}): ${modifiedText}`);
      logger.debug(`Duration: ${duration}ms, Rows: ${res.rowCount}`);
    }

    return res;
  } catch (error) {
    logger.error(`Query error: ${error.message}`);
    logger.error(`Query (${domain || 'no domain'}): ${modifiedText}`);
    throw error;
  }
};

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

module.exports = {
  pool,
  connectDB,
  query,
};

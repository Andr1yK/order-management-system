const { query } = require('../config/db');

/**
 * Create tables if they don't exist
 */
const initializeTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      role VARCHAR(20) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await query(createUsersTable);
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
const create = async (userData) => {
  const { name, email, password, phone, address, role } = userData;

  const sql = `
    INSERT INTO users (name, email, password, phone, address, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email, phone, address, role, created_at, updated_at
  `;

  const values = [name, email, password, phone, address, role || 'customer'];

  const result = await query(sql, values);
  return result.rows[0];
};

/**
 * Find a user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} - Found user or null
 */
const findById = async (id) => {
  const sql = `
    SELECT id, name, email, phone, address, role, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  const result = await query(sql, [id]);
  return result.rows[0] || null;
};

/**
 * Find a user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} - Found user or null
 */
const findByEmail = async (email) => {
  const sql = `
    SELECT id, name, email, password, phone, address, role, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  const result = await query(sql, [email]);
  return result.rows[0] || null;
};

/**
 * Find all users
 * @param {number} limit - Limit of users to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} - Array of users
 */
const findAll = async (limit = 10, offset = 0) => {
  const sql = `
    SELECT id, name, email, phone, address, role, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await query(sql, [limit, offset]);
  return result.rows;
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object|null>} - Updated user or null
 */
const update = async (id, userData) => {
  const { name, email, phone, address, role } = userData;

  const sql = `
    UPDATE users
    SET name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        role = COALESCE($5, role),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING id, name, email, phone, address, role, created_at, updated_at
  `;

  const values = [name, email, phone, address, role, id];

  const result = await query(sql, values);
  return result.rows[0] || null;
};

/**
 * Update a user's password
 * @param {number} id - User ID
 * @param {string} password - New password (hashed)
 * @returns {Promise<boolean>} - True if successful
 */
const updatePassword = async (id, password) => {
  const sql = `
    UPDATE users
    SET password = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `;

  const result = await query(sql, [password, id]);
  return result.rowCount > 0;
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - True if successful
 */
const remove = async (id) => {
  const sql = 'DELETE FROM users WHERE id = $1';

  const result = await query(sql, [id]);
  return result.rowCount > 0;
};

/**
 * Count total users
 * @returns {Promise<number>} - Total count of users
 */
const count = async () => {
  const sql = 'SELECT COUNT(*) as total FROM users';

  const result = await query(sql);
  return parseInt(result.rows[0].total, 10);
};

module.exports = {
  initializeTables,
  create,
  findById,
  findByEmail,
  findAll,
  update,
  updatePassword,
  remove,
  count
};

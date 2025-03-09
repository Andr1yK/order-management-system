const { query } = require('../config/db');
const { logger } = require('../utils/logger');

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

  if (process.env.USE_NEW_SCHEMA === 'true') {
    try {
      const newSql = `
          INSERT INTO users_schema.users (id, name, email, password, phone, address, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
      `;

      const newValues = [
        result.rows[0].id,
        name,
        email,
        password,
        phone,
        address,
        role || 'customer',
        result.rows[0].created_at,
        result.rows[0].updated_at
      ];

      await query(newSql, newValues, null);
    } catch (err) {
      logger.error(`Error creating user in new schema: ${err.message}`);
    }
  }

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

  if (process.env.USE_NEW_SCHEMA === 'true') {
    try {
      const newSql = `
          UPDATE users_schema.users
          SET name = COALESCE($1, name),
              email = COALESCE($2, email),
              phone = COALESCE($3, phone),
              address = COALESCE($4, address),
              role = COALESCE($5, role),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
          RETURNING id, name, email, phone, address, role, created_at, updated_at
      `;

      const newValues = [name, email, phone, address, role, id];

      await query(newSql, newValues, null);
    } catch (err) {
      logger.error(`Error updating user in new schema: ${err.message}`);
    }
  }

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

  if (process.env.USE_NEW_SCHEMA === 'true') {
    try {
      const newSql = `
          UPDATE users_schema.users
          SET password = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
      `;

      await query(newSql, [password, id], null);
    } catch (err) {
      logger.error(`Error updating user password in new schema: ${err.message}`);
    }
  }

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

  if (process.env.USE_NEW_SCHEMA === 'true') {
    try {
      const newSql = 'DELETE FROM users_schema.users WHERE id = $1';
      await query(newSql, [id], null);
    } catch (err) {
      logger.error(`Error deleting user in new schema: ${err.message}`);
    }
  }

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
  create,
  findById,
  findByEmail,
  findAll,
  update,
  updatePassword,
  remove,
  count
};

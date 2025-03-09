const { query } = require('../config/db');
const { logger } = require('../utils/logger');

/**
 * Create a new order with items
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order
 */
const create = async (orderData) => {
  const { user_id, items, status = 'pending' } = orderData;

  // Calculate total amount from items
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Begin transaction
  const client = await require('../config/db').pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Insert order
    const orderSQL = `
      INSERT INTO orders (user_id, status, total_amount)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, status, total_amount, created_at, updated_at
    `;

    const orderValues = [user_id, status, totalAmount];
    const orderResult = await client.query(orderSQL, orderValues);
    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      const itemSQL = `
        INSERT INTO order_items (order_id, product_name, quantity, price, total)
        VALUES ($1, $2, $3, $4, $5)
      `;

      const itemTotal = item.quantity * item.price;
      const itemValues = [order.id, item.product_name, item.quantity, item.price, itemTotal];

      await client.query(itemSQL, itemValues);
    }

    // Commit transaction
    await client.query('COMMIT');

    if (process.env.USE_NEW_SCHEMA === 'true') {
      try {
        await client.query('BEGIN');

        const newOrderSQL = `
          INSERT INTO orders_schema.orders (id, user_id, status, total_amount, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `;

        const newOrderValues = [
          order.id,
          user_id,
          status,
          totalAmount,
          order.created_at,
          order.updated_at
        ];

        await client.query(newOrderSQL, newOrderValues);

        for (const item of items) {
          const newItemSQL = `
            INSERT INTO orders_schema.order_items (id, order_id, product_name, quantity, price, total)
            VALUES (DEFAULT, $1, $2, $3, $4, $5)
            ON CONFLICT (id) DO NOTHING
          `;

          const newItemTotal = item.quantity * item.price;
          const newItemValues = [
            order.id,
            item.product_name,
            item.quantity,
            item.price,
            newItemTotal,
          ];

          await client.query(newItemSQL, newItemValues);
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating order in new schema', error);
      }
    }

    // Return complete order with items
    return await findById(order.id);
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // Release client
    client.release();
  }
};

/**
 * Find an order by ID with all items
 * @param {number} id - Order ID
 * @returns {Promise<Object|null>} - Found order or null
 */
const findById = async (id) => {
  // Get order
  const orderSQL = `
    SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at,
           u.name as user_name, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = $1
  `;

  const orderResult = await query(orderSQL, [id]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  // Get order items
  const itemsSQL = `
    SELECT id, product_name, quantity, price, total
    FROM order_items
    WHERE order_id = $1
  `;

  const itemsResult = await query(itemsSQL, [id]);

  // Add items to order
  order.items = itemsResult.rows;

  return order;
};

/**
 * Find all orders
 * @param {Object} filters - Filter options
 * @param {number} limit - Limit of orders to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} - Array of orders
 */
const findAll = async (filters = {}, limit = 10, offset = 0) => {
  const { user_id, status } = filters;

  let conditions = [];
  const values = [];
  let paramIndex = 1;

  if (user_id) {
    conditions.push(`o.user_id = $${paramIndex}`);
    values.push(user_id);
    paramIndex++;
  }

  if (status) {
    conditions.push(`o.status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Add limit and offset
  values.push(limit);
  values.push(offset);

  const orderSQL = `
    SELECT o.id, o.user_id, o.status, o.total_amount, o.created_at, o.updated_at,
           u.name as user_name, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ${whereClause}
    ORDER BY o.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const orderResult = await query(orderSQL, values);

  // Get all order IDs
  const orderIds = orderResult.rows.map(order => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  // Get all items for these orders
  const itemsSQL = `
      SELECT id, order_id, product_name, quantity, price, total
      FROM order_items
      WHERE order_id = ANY($1)
  `;

  const itemsResult = await query(itemsSQL, [orderIds]);

  // Group items by order_id
  const itemsByOrderId = {};
  itemsResult.rows.forEach(item => {
    if (!itemsByOrderId[item.order_id]) {
      itemsByOrderId[item.order_id] = [];
    }
    itemsByOrderId[item.order_id].push(item);
  });

  // Add items to orders
  orderResult.rows.forEach(order => {
    order.items = itemsByOrderId[order.id] || [];
  });

  return orderResult.rows;
};

/**
 * Update an order's status
 * @param {number} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object|null>} - Updated order or null
 */
const updateStatus = async (id, status) => {
  const sql = `
    UPDATE orders
    SET status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, user_id, status, total_amount, created_at, updated_at
  `;

  const result = await query(sql, [status, id]);

  if (result.rows.length === 0) {
    return null;
  }

  if (process.env.USE_NEW_SCHEMA === 'true') {
    try {
      const newSql = `
        UPDATE orders_schema.orders
        SET status = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, user_id, status, total_amount, created_at, updated_at
      `;

      await query(newSql, [status, id]);
    } catch (error) {
      logger.error('Error updating order status in new schema', error);
    }
  }

  // Get complete order with items
  return await findById(id);
};

/**
 * Delete an order
 * @param {number} id - Order ID
 * @returns {Promise<boolean>} - True if successful
 */
const remove = async (id) => {
  // Order items will be deleted via CASCADE constraint
  const sql = 'DELETE FROM orders WHERE id = $1';

  const result = await query(sql, [id]);

  if (process.env.USE_NEW_SCHEMA === 'true') {
    try {
      const newSql = 'DELETE FROM orders_schema.orders WHERE id = $1';
      await query(newSql, [id]);
    } catch (error) {
      logger.error('Error deleting order in new schema', error);
    }
  }

  return result.rowCount > 0;
};

/**
 * Count total orders with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<number>} - Total count of orders
 */
const count = async (filters = {}) => {
  const { user_id, status } = filters;

  let conditions = [];
  const values = [];
  let paramIndex = 1;

  if (user_id) {
    conditions.push(`user_id = $${paramIndex}`);
    values.push(user_id);
    paramIndex++;
  }

  if (status) {
    conditions.push(`status = $${paramIndex}`);
    values.push(status);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `SELECT COUNT(*) as total FROM orders ${whereClause}`;

  const result = await query(sql, values);
  return parseInt(result.rows[0].total, 10);
};

module.exports = {
  create,
  findById,
  findAll,
  updateStatus,
  remove,
  count
};

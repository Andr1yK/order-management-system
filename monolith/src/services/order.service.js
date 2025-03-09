const { Order, OrderItem } = require('../models');
const { ApiError } = require('../middlewares/error.middleware');
const { sequelize } = require('../config/sequelize');
const axios = require("axios");

const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3030';

/**
 * Check if a user exists
 * @param {number} userId - User ID
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - User data
 */
const validateUserExists = async (userId, token) => {
  try {
    const response = await axios.get(`${userServiceUrl}/api/users/${userId}`, {
      headers: token ? { 'Authorization': token } : {}
    });
    return response.data.data.user;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new ApiError(404, 'User not found');
      }
      throw new ApiError(error.response.status, error.response.data.message || 'Error from user service');
    }
    throw new ApiError(500, 'User service unavailable');
  }
};

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @param {string} token - JWT token from request
 * @returns {Promise<Object>} - Created order
 */
const createOrder = async (orderData, token) => {
  try {
    const { user_id, items, status = 'pending' } = orderData;

    // Validate user existence
    await validateUserExists(user_id, token);

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    // Validate each item
    items.forEach(item => {
      if (!item.product_name || !item.quantity || !item.price) {
        throw new ApiError(400, 'Each item must have a product name, quantity, and price');
      }

      if (item.quantity <= 0) {
        throw new ApiError(400, 'Item quantity must be greater than 0');
      }

      if (item.price <= 0) {
        throw new ApiError(400, 'Item price must be greater than 0');
      }
    });

    // Calculate total amount from items
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    // Create order within a transaction
    const result = await sequelize.transaction(async (t) => {
      // Insert order
      const order = await Order.create({
        user_id,
        status,
        total_amount: totalAmount
      }, { transaction: t });

      // Insert order items
      const orderItems = await Promise.all(
        items.map(item => {
          const itemTotal = item.quantity * item.price;
          return OrderItem.create({
            order_id: order.id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            total: itemTotal
          }, { transaction: t });
        })
      );

      return { order, orderItems };
    });

    // Return complete order with items
    return await getOrderById(result.order.id, token);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Get an order by ID with all items
 * @param {number} id - Order ID
 * @param {string} token - JWT token from request
 * @returns {Promise<Object>} - Order object
 */
const getOrderById = async (id, token) => {
  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Get user information from user-service
    const user = await validateUserExists(order.user_id, token);

    // Format response
    const formattedOrder = order.toJSON();
    formattedOrder.user_name = user.name;
    formattedOrder.user_email = user.email;

    return formattedOrder;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Get all orders with filtering and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} token - JWT token from request
 * @returns {Promise<Object>} - Paginated orders
 */
const getAllOrders = async (filters = {}, page = 1, limit = 10, token) => {
  try {
    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (filters.status) where.status = filters.status;
    if (filters.user_id) where.user_id = filters.user_id;

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    // Get unique user IDs
    const userIds = [...new Set(rows.map(order => order.user_id))];

    // Fetch user information for all orders in one batch if possible
    let userMap = {};
    try {
      const usersResponse = await axios.get(`${userServiceUrl}/api/users/batch`, {
        params: { ids: userIds.join(',') },
        headers: token ? { 'Authorization': token } : {}
      });

      // Create a map of user_id to user data
      userMap = usersResponse.data.data.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});
    } catch (error) {
      console.error('Failed to fetch users in batch, falling back to individual requests');

      // Fallback: Fetch each user individually
      for (const userId of userIds) {
        try {
          const user = await validateUserExists(userId, token);
          userMap[userId] = user;
        } catch (error) {
          // If user not found, continue with partial data
          console.error(`Failed to fetch user ${userId}: ${error.message}`);
        }
      }
    }

    // Format response
    const orders = rows.map(order => {
      const formattedOrder = order.toJSON();
      const user = userMap[order.user_id] || {};

      formattedOrder.user_name = user.name || 'Unknown User';
      formattedOrder.user_email = user.email || 'unknown@email.com';

      return formattedOrder;
    });


    return {
      orders,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

/**
 * Get all orders for a user
 * @param {number} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} token - JWT token from request
 * @returns {Promise<Object>} - Paginated orders
 */
const getUserOrders = async (userId, page = 1, limit = 10, token) => {
  try {
    // Check if user exists
    await validateUserExists(userId, token);

    // Get user orders
    return await getAllOrders({ user_id: userId }, page, limit, token);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new ApiError(404, 'User not found');
      }

      throw new ApiError(error.response.status, error.response.data.message || 'Error from user service');
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, error.message || 'Internal Server Error');
  }
};

/**
 * Update an order's status
 * @param {number} id - Order ID
 * @param {string} status - New status
 * @param {string} token - JWT token from request
 * @returns {Promise<Object>} - Updated order
 */
const updateOrderStatus = async (id, status, token) => {
  try {
    // Check if order exists
    const order = await Order.findByPk(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Update order status
    await order.update({ status });

    // Get updated order with items
    return await getOrderById(id, token);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Delete an order
 * @param {number} id - Order ID
 * @returns {Promise<boolean>} - True if successful
 */
const deleteOrder = async (id) => {
  try {
    // Check if order exists
    const order = await Order.findByPk(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Delete order (cascades to items)
    await order.destroy();

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  deleteOrder
};

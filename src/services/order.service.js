const Order = require('../models/order.model');
const User = require('../models/user.model');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order
 */
const createOrder = async (orderData) => {
  try {
    const { user_id, items } = orderData;

    // Validate user existence
    const user = await User.findById(user_id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

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

    // Create order
    const order = await Order.create(orderData);

    return order;
  } catch (error) {
    throw error;
  }
};

/**
 * Get an order by ID
 * @param {number} id - Order ID
 * @returns {Promise<Object>} - Order object
 */
const getOrderById = async (id) => {
  try {
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders with filtering and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - Paginated orders
 */
const getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const orders = await Order.findAll(filters, limit, offset);
    const totalOrders = await Order.count(filters);

    return {
      orders,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalItems: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders for a user
 * @param {number} userId - User ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - Paginated orders
 */
const getUserOrders = async (userId, page = 1, limit = 10) => {
  try {
    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get user orders
    return await getAllOrders({ user_id: userId }, page, limit);
  } catch (error) {
    throw error;
  }
};

/**
 * Update an order's status
 * @param {number} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated order
 */
const updateOrderStatus = async (id, status) => {
  try {
    // Check if order exists
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Update order status
    const updatedOrder = await Order.updateStatus(id, status);

    return updatedOrder;
  } catch (error) {
    throw error;
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
    const order = await Order.findById(id);

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Delete order
    await Order.remove(id);

    return true;
  } catch (error) {
    throw error;
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

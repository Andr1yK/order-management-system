const { Order, OrderItem, User } = require('../models');
const { ApiError } = require('../middlewares/error.middleware');
const { sequelize } = require('../config/sequelize');

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} - Created order
 */
const createOrder = async (orderData) => {
  try {
    const { user_id, items, status = 'pending' } = orderData;

    // Validate user existence
    const user = await User.findByPk(user_id);

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
    return await getOrderById(result.order.id);
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
 * @returns {Promise<Object>} - Order object
 */
const getOrderById = async (id) => {
  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Format response
    const formattedOrder = order.toJSON();
    formattedOrder.user_name = order.user.name;
    formattedOrder.user_email = order.user.email;

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
 * @returns {Promise<Object>} - Paginated orders
 */
const getAllOrders = async (filters = {}, page = 1, limit = 10) => {
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
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    // Format response
    const orders = rows.map(order => {
      const formattedOrder = order.toJSON();
      formattedOrder.user_name = order.user.name;
      formattedOrder.user_email = order.user.email;
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
 * @returns {Promise<Object>} - Paginated orders
 */
const getUserOrders = async (userId, page = 1, limit = 10) => {
  try {
    // Check if user exists
    const user = await User.findByPk(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get user orders
    return await getAllOrders({ user_id: userId }, page, limit);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
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
    return await getOrderById(id);
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

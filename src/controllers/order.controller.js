const orderService = require('../services/order.service');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Create a new order
 * @route POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    // If user_id is not provided, use the authenticated user's ID
    const orderData = {
      ...req.body,
      user_id: req.body.user_id || req.user.id
    };

    // Only admins can create orders for other users
    if (req.user.role !== 'admin' && req.body.user_id && parseInt(req.body.user_id, 10) !== parseInt(req.user.id, 10)) {
      return next(new ApiError(403, 'You are not authorized to create orders for other users'));
    }

    const order = await orderService.createOrder(orderData);

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete order
 * @route DELETE /api/orders/:id
 */
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the order to check ownership
    const order = await orderService.getOrderById(parseInt(id, 10));

    // Only admins can delete orders they don't own
    if (req.user.role !== 'admin' && parseInt(order.user_id, 10) !== parseInt(req.user.id, 10)) {
      return next(new ApiError(403, 'You are not authorized to delete this order'));
    }

    await orderService.deleteOrder(parseInt(id, 10));

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders
 * @route GET /api/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, user_id } = req.query;
    let filters = {};

    // Apply filters
    if (status) filters.status = status;

    // Regular users can only see their own orders
    if (req.user.role !== 'admin') {
      filters.user_id = req.user.id;
    } else if (user_id) {
      // Admins can filter by user_id
      filters.user_id = parseInt(user_id, 10);
    }

    const result = await orderService.getAllOrders(
      filters,
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.status(200).json({
      status: 'success',
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await orderService.getOrderById(parseInt(id, 10));

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && parseInt(order.user_id, 10) !== parseInt(req.user.id, 10)) {
      return next(new ApiError(403, 'You are not authorized to view this order'));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get orders for a specific user
 * @route GET /api/users/:userId/orders
 */
const getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if user is authorized to view these orders
    if (req.user.role !== 'admin' && parseInt(userId, 10) !== parseInt(req.user.id, 10)) {
      return next(new ApiError(403, 'You are not authorized to view orders for this user'));
    }

    const result = await orderService.getUserOrders(
      parseInt(userId, 10),
      parseInt(page, 10),
      parseInt(limit, 10)
    );

    res.status(200).json({
      status: 'success',
      data: result.orders,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 * @route PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    if (!status) {
      return next(new ApiError(400, 'Status is required'));
    }

    // Get the order to check ownership
    const order = await orderService.getOrderById(parseInt(id, 10));

    // Only admins can update orders they don't own
    if (req.user.role !== 'admin' && parseInt(order.user_id, 10) !== parseInt(req.user.id, 10)) {
      return next(new ApiError(403, 'You are not authorized to update this order'));
    }

    const updatedOrder = await orderService.updateOrderStatus(parseInt(id, 10), status);

    res.status(200).json({
      status: 'success',
      data: {order: updatedOrder}
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  deleteOrder
};

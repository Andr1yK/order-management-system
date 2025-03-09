const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes - require authentication
router.use(authenticate);

router.route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router.route('/:id')
  .get(orderController.getOrderById)
  .delete(orderController.deleteOrder);

// Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// Get user orders
router.get('/:userId/orders', authenticate, orderController.getUserOrders);

module.exports = router;

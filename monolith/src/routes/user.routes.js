const express = require('express');
const userController = require('../controllers/user.controller');
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get current user
router.get('/me', authenticate, userController.getCurrentUser);

// Get user orders
router.get('/:userId/orders', authenticate, orderController.getUserOrders);

// Admin routes
router.route('/')
  .get(authenticate, authorize('admin'), userController.getAllUsers)
  .post(authenticate, authorize('admin'), userController.createUser);

// User routes (authenticated)
router.route('/:id')
  .get(authenticate, userController.getUserById)
  .patch(authenticate, userController.updateUser)
  .delete(authenticate, userController.deleteUser);

// Update password route
router.patch('/:id/password', authenticate, userController.updatePassword);

module.exports = router;

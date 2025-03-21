const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get current user
router
  .get('/me', authenticate, userController.getCurrentUser)
  .patch('/me', authenticate, userController.updateMe)

// Admin routes
router.route('/')
  .get(authenticate, authorize('admin'), userController.getAllUsers)
  .post(authenticate, authorize('admin'), userController.createUser);

router.route('/batch')
  .get(authenticate, authorize('admin'), userController.getUsersByIds);

// User routes (authenticated)
router.route('/:id')
  .get(authenticate, userController.getUserById)
  .patch(authenticate, userController.updateUser)
  .delete(authenticate, userController.deleteUser);

// Update password route
router.patch('/:id/password', authenticate, userController.updatePassword);

module.exports = router;

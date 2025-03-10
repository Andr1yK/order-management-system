const userService = require('../services/user.service');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Create a new user
 * @route POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users
 * @route GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await userService.getAllUsers(parseInt(page, 10), parseInt(limit, 10));

    res.status(200).json({
      status: 'success',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(parseInt(id, 10));

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get users by IDs
 * @route GET /api/users/batch
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const getUsersByIds = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return next(new ApiError(400, 'User IDs are required'));
    }

    const idsArray = ids.split(',').map(id => parseInt(id, 10));

    const users = await userService.getUsersByIds(idsArray);

    res.status(200).json({
      status: 'success',
      data: users || [],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user (based on token)
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const updateMe = async (req, res, next) => {
  try {
    const params = { ...req.body };

    // Prevent role update by non-admins
    if (params.role && req.user.role !== 'admin' && params.role !== req.user.role) {
      return next(new ApiError(403, 'You are not authorized to update roles'));
    }

    const updatedUser = await userService.updateUser(req.user.id, params);

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user
 * @route PATCH /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check authorization (only admin or the user themselves can update)
    if (req.user.role !== 'admin' && parseInt(req.user.id, 10) !== parseInt(id, 10)) {
      return next(new ApiError(403, 'You are not authorized to update this user'));
    }

    // Prevent role update by non-admins
    if (req.body.role && req.user.role !== 'admin') {
      return next(new ApiError(403, 'You are not authorized to update roles'));
    }

    const updatedUser = await userService.updateUser(parseInt(id, 10), req.body);

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user password
 * @route PATCH /api/users/:id/password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Check authorization (only the user themselves can update their password)
    if (parseInt(req.user.id, 10) !== parseInt(id, 10)) {
      return next(new ApiError(403, 'You are not authorized to update this user\'s password'));
    }

    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, 'Current password and new password are required'));
    }

    await userService.updatePassword(parseInt(id, 10), currentPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check authorization (only admin or the user themselves can delete)
    if (req.user.role !== 'admin' && parseInt(req.user.id, 10) !== parseInt(id, 10)) {
      return next(new ApiError(403, 'You are not authorized to delete this user'));
    }

    await userService.deleteUser(parseInt(id, 10));

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user (based on token)
 * @route GET /api/users/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUsersByIds,
  updateMe,
  updateUser,
  updatePassword,
  deleteUser,
  getCurrentUser
};

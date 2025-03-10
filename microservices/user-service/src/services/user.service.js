const { User } = require('../models');
const { hashPassword } = require('../config/auth');
const { ApiError } = require('../middlewares/error.middleware');
const { Op } = require('sequelize');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
const createUser = async (userData) => {
  try {
    // Check if user with same email already exists
    const existingUser = await User.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ApiError(409, 'Email is already in use');
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user with hashed password
    const user = await User.create({
      ...userData,
      password: hashedPassword
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    return userResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Get a user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} - User object
 */
const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Get users by IDs
 * @param {Array<number>} ids - User IDs
 * @returns {Promise<void>}
 */
const getUsersByIds = async (ids) => {
  try {
    const users = await User.findAll({
      where: {
        id: {
          [Op.in]: ids
        },
      },
      attributes: { exclude: ['password'] }
    });

    return users;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
}

/**
 * Get a user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} - User object with password
 */
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Get all users with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} - Paginated users
 */
const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      users: rows,
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
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Updated user
 */
const updateUser = async (id, userData) => {
  try {
    // Check if user exists
    const existingUser = await User.findByPk(id);

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if email is being changed and already exists
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await User.findOne({
        where: { email: userData.email }
      });

      if (userWithEmail) {
        throw new ApiError(409, 'Email is already in use');
      }
    }

    // Update user
    await existingUser.update(userData);

    // Get updated user without password
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Update a user's password
 * @param {number} id - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} - True if successful
 */
const updatePassword = async (id, currentPassword, newPassword) => {
  try {
    // Get user with password
    const user = await User.findByPk(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check current password
    const isPasswordValid = await require('../config/auth').comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message);
  }
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - True if successful
 */
const deleteUser = async (id) => {
  try {
    // Check if user exists
    const user = await User.findByPk(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete user
    await user.destroy();

    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, error.message);
  }
};

module.exports = {
  createUser,
  getUserById,
  getUsersByIds,
  getUserByEmail,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser
};

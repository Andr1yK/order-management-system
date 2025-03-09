const User = require('../models/user.model');
const { hashPassword } = require('../config/auth');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} - Created user
 */
const createUser = async (userData) => {
  try {
    // Check if user with same email already exists
    const existingUser = await User.findByEmail(userData.email);

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

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object>} - User object
 */
const getUserById = async (id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} - User object with password
 */
const getUserByEmail = async (email) => {
  try {
    const user = await User.findByEmail(email);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  } catch (error) {
    throw error;
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

    const users = await User.findAll(limit, offset);
    const totalUsers = await User.count();

    return {
      users,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    };
  } catch (error) {
    throw error;
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
    const existingUser = await User.findById(id);

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if email is being changed and already exists
    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await User.findByEmail(userData.email);

      if (userWithEmail) {
        throw new ApiError(409, 'Email is already in use');
      }
    }

    // Update user
    const updatedUser = await User.update(id, userData);

    return updatedUser;
  } catch (error) {
    throw error;
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
    const user = await User.findByEmail((await User.findById(id)).email);

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
    await User.updatePassword(id, hashedPassword);

    return true;
  } catch (error) {
    throw error;
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
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete user
    await User.remove(id);

    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser
};

const userService = require('./user.service');
const { comparePassword, generateToken } = require('../config/auth');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User and token
 */
const register = async (userData) => {
  try {
    // Create user
    const user = await userService.createUser(userData);

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return { user, token };
  } catch (error) {
    throw error;
  }
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User and token
 */
const login = async (email, password) => {
  try {
    // Get user with password
    const user = await userService.getUserByEmail(email);

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    // Hide specific errors for security
    if (error.statusCode === 404) {
      throw new ApiError(401, 'Invalid credentials');
    }
    throw error;
  }
};

module.exports = {
  register,
  login
};

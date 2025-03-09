const authService = require('../services/auth.service');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return next(new ApiError(400, 'Name, email, and password are required'));
    }

    const result = await authService.register({
      name,
      email,
      password,
      phone,
      address,
      role: 'customer' // Default role for registration
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Email and password are required'));
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      status: 'success',
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};

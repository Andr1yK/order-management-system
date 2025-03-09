const { verifyToken } = require('../config/auth');
const { ApiError } = require('./error.middleware');
const userService = require('../services/user.service');

/**
 * Middleware to check if user is authenticated
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Not authenticated. Please log in.'));
    }

    // Get token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new ApiError(401, 'Not authenticated. Please log in.'));
    }

    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await userService.getUserById(decoded.id);

    if (!user) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param {...string} roles - Roles that are allowed to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated. Please log in.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

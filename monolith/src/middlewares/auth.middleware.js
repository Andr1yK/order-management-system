const { verifyToken } = require('../config/auth');
const { ApiError } = require('./error.middleware');

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

    // Grant access to protected route
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired! Please log in again.'));
    }

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

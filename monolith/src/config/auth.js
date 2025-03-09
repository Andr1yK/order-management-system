const jwt = require('jsonwebtoken');

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  verifyToken,
};

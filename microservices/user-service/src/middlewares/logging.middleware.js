const { logger, requestLogger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Middleware for logging incoming requests
 */
const loggingMiddleware = (req, res, next) => {
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = uuidv4();
  }

  const startTime = Date.now();

  const reqLogger = requestLogger(req);
  reqLogger.info('Incoming request', {
    query: req.query,
    body: sanitizeRequestBody(req.body)
  });

  const originalSend = res.send;
  res.send = function (body) {
    const responseTime = Date.now() - startTime;

    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    reqLogger[logLevel]('Request completed', {
      statusCode: res.statusCode,
      responseTime
    });

    return originalSend.call(this, body);
  };

  next();
};

/**
 * Sanitize request body before logging
 */
function sanitizeRequestBody(body) {
  if (!body) return body;

  const sanitized = { ...body };

  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';

  return sanitized;
}

module.exports = { loggingMiddleware };

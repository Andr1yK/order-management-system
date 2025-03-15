const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'unknown-service',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.Console()
  ]
});

const addRequestContext = (req) => {
  return {
    requestId: req.headers['x-request-id'] || 'unknown',
    method: req.method,
    path: req.path,
    userId: req.user?.id || 'unknown',
    ip: req.ip
  };
};

const requestLogger = (req) => {
  const requestContext = addRequestContext(req);

  return {
    info: (message, meta = {}) => {
      logger.info(message, {
        ...requestContext,
        ...meta
      });
    },
    error: (message, meta = {}) => {
      logger.error(message, {
        ...requestContext,
        ...meta
      });
    },
    warn: (message, meta = {}) => {
      logger.warn(message, {
        ...requestContext,
        ...meta
      });
    },
    debug: (message, meta = {}) => {
      logger.debug(message, {
        ...requestContext,
        ...meta
      });
    }
  };
};

module.exports = { logger, requestLogger };

const config = require('../config/env');

/**
 * Centralized API Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode || 500;

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
    status: statusCode
  };

  // Only include stack trace in development
  if (config.env === 'development') {
    response.stack = err.stack;
  }

  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode} - ${err.message}`);

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

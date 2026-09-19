// =============================================
// server/src/middleware/errorMiddleware.js
// Centralized Express Error Handling Middleware
// =============================================

// 404 Handler: Triggered when no route matches the request URL
const notFound = (req, res, _next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  res.json({
    success: false,
    message: error.message,
  });
};

// Global Error Handler: Catches all errors passed via next(err)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[API ERROR] ${err.stack || err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development mode for debugging
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = {
  notFound,
  errorHandler,
};

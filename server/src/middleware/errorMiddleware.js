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
  // If res.statusCode was not explicitly set to a 4xx status, check error type
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Postgres constraint & validation errors: 23505 (unique), 23502 (not null), 22P02 (invalid input syntax), 23503 (FK)
  if (err.code === '23505' || err.code === '23502' || err.code === '22P02' || err.name === 'ValidationError') {
    statusCode = 400;
  }

  console.error(`[API ERROR] Status ${statusCode} - ${err.stack || err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Validation failed. Please check your inputs.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};


module.exports = {
  notFound,
  errorHandler,
};

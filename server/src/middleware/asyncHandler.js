// =============================================
// server/src/middleware/asyncHandler.js
//
// CONCEPT: Higher-Order Async Handler Function
// =============================================
// Problem: In Express, if an `async` route handler throws an error
// or rejects a Promise (e.g. database network error), Express 4
// will NOT catch it automatically. The request would hang forever!
//
// Solution: This wrapper takes an async function `fn`, executes it,
// and automatically catches any errors, passing them to `next(err)`.
//
// Usage in Controllers:
//   exports.getPatients = asyncHandler(async (req, res) => { ... });
// =============================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

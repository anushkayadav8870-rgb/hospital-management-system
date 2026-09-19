// =============================================
// server/src/middleware/authMiddleware.js
// Bearer Token Verification Middleware
// =============================================

const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const db = require('../db');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for Authorization header starting with "Bearer "
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token string after "Bearer "
      token = req.headers.authorization.split(' ')[1];

      // Verify cryptographic signature
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallback_secret_change_in_production'
      );

      // Fetch user from DB (excluding password_hash)
      const userResult = await db.query(
        'SELECT id, email, role, first_name, last_name, phone, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        res.status(401);
        throw new Error('Not authorized: User account is inactive or no longer exists.');
      }

      // Attach user object to Express request (req.user)
      req.user = userResult.rows[0];
      return next();
    } catch (err) {
      console.error('JWT Authentication Error:', err.message);
      res.status(401);
      throw new Error('Not authorized: Invalid or expired token.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized: Missing Bearer token in request header.');
  }
});

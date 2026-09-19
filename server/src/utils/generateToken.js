// =============================================
// server/src/utils/generateToken.js
// JWT Token Signing Helper
// =============================================

const jwt = require('jsonwebtoken');

// Sign a new JWT containing user ID and role
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'fallback_secret_change_in_production',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;

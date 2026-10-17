// =============================================
// server/src/routes/authRoutes.js
// Authentication Route Definitions
// =============================================

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { loginRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerUser);
router.post('/login', loginRateLimiter(), loginUser);
router.get('/me', protect, getMe);

module.exports = router;

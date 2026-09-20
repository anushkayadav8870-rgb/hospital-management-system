// =============================================
// server/src/routes/analyticsRoutes.js
// Analytics Routes
// =============================================

const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/dashboard', getDashboardMetrics);

module.exports = router;

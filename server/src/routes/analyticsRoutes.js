// =============================================
// server/src/routes/analyticsRoutes.js
// Analytics Routes
// =============================================

const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getDatabaseViewer } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/dashboard', getDashboardMetrics);
router.get('/db-viewer', authorize('ADMIN'), getDatabaseViewer);

module.exports = router;


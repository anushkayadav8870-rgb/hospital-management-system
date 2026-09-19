// =============================================
// server/src/routes/healthRoutes.js
// Health Check API Routes
// =============================================

const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('../controllers/healthController');

// Map GET /api/health to getHealthStatus controller
router.get('/health', getHealthStatus);

module.exports = router;

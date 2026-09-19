// =============================================
// server/src/controllers/healthController.js
// API Health & Database Diagnostic Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get API & Database System Health
// @route   GET /api/health
// @access  Public
exports.getHealthStatus = asyncHandler(async (_req, res) => {
  let dbStatus = 'Disconnected';
  let dbTimestamp = null;

  try {
    // Execute a lightweight query to test database connectivity
    const dbResult = await db.query('SELECT NOW() as db_time');
    if (dbResult && dbResult.rows.length > 0) {
      dbStatus = 'Connected';
      dbTimestamp = dbResult.rows[0].db_time;
    }
  } catch (dbErr) {
    console.warn('Database health check warning (DB offline or credentials pending):', dbErr.message);
    dbStatus = `Unavailable (${dbErr.message})`;
  }

  res.status(200).json({
    success: true,
    message: 'PulseCare HMS API backend is operational.',
    data: {
      serverStatus: 'Online',
      databaseStatus: dbStatus,
      databaseTime: dbTimestamp,
      environment: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    },
  });
});

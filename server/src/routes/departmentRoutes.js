// =============================================
// server/src/routes/departmentRoutes.js
// Department Routes
// =============================================

const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getDepartments)
  .post(authorize('ADMIN'), createDepartment);

module.exports = router;

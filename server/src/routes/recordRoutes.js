// =============================================
// server/src/routes/recordRoutes.js
// Electronic Medical Records (EMR) Routes
// =============================================

const express = require('express');
const router = express.Router();
const {
  getMedicalRecords,
  getRecordById,
  createMedicalRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getMedicalRecords)
  .post(authorize('ADMIN', 'DOCTOR'), createMedicalRecord);

router
  .route('/:id')
  .get(getRecordById);

module.exports = router;

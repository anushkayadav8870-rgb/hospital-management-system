// =============================================
// server/src/routes/prescriptionRoutes.js
// Prescription Routes
// =============================================

const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getPrescriptions)
  .post(authorize('ADMIN', 'DOCTOR'), createPrescription);

router
  .route('/:id')
  .get(getPrescriptionById);

module.exports = router;

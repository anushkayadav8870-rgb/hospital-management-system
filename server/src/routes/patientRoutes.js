// =============================================
// server/src/routes/patientRoutes.js
// Patient Management Routes
// =============================================

const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deactivatePatient,
} = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Require authentication for all patient endpoints
router.use(protect);

router
  .route('/')
  .get(authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getPatients)
  .post(authorize('ADMIN', 'RECEPTIONIST'), createPatient);

router
  .route('/:id')
  .get(authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), getPatientById)
  .put(authorize('ADMIN', 'RECEPTIONIST'), updatePatient);

router
  .route('/:id/deactivate')
  .patch(authorize('ADMIN'), deactivatePatient);

module.exports = router;

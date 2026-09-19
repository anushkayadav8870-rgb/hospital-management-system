// =============================================
// server/src/routes/doctorRoutes.js
// Doctor Management Routes
// =============================================

const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deactivateDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getDoctors)
  .post(authorize('ADMIN'), createDoctor);

router
  .route('/:id')
  .get(getDoctorById)
  .put(authorize('ADMIN', 'DOCTOR'), updateDoctor);

router
  .route('/:id/deactivate')
  .patch(authorize('ADMIN'), deactivateDoctor);

module.exports = router;

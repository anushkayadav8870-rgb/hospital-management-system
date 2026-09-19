// =============================================
// server/src/routes/appointmentRoutes.js
// Appointment Routes
// =============================================

const express = require('express');
const router = express.Router();
const {
  getAppointments,
  bookAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getAppointments)
  .post(authorize('ADMIN', 'RECEPTIONIST', 'PATIENT'), bookAppointment);

router
  .route('/:id/status')
  .patch(authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), updateAppointmentStatus);

module.exports = router;

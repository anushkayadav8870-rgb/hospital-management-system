// =============================================
// server/src/routes/billingRoutes.js
// Billing & Invoicing Routes
// =============================================

const express = require('express');
const router = express.Router();
const {
  getBills,
  createBill,
  recordPayment,
} = require('../controllers/billingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getBills)
  .post(authorize('ADMIN', 'RECEPTIONIST'), createBill);

router
  .route('/:id/payments')
  .post(authorize('ADMIN', 'RECEPTIONIST'), recordPayment);

module.exports = router;

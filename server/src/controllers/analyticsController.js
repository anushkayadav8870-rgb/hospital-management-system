// =============================================
// server/src/controllers/analyticsController.js
// Analytics & Role-Based Dashboard Metrics Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get dashboard metrics tailored to logged-in user role
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardMetrics = asyncHandler(async (req, res) => {
  const { role, id: userId } = req.user;

  if (role === 'ADMIN' || role === 'RECEPTIONIST') {
    // Macro Hospital Aggregations
    const patientCount = await db.query('SELECT COUNT(*)::INT FROM patients');
    const doctorCount = await db.query('SELECT COUNT(*)::INT FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.is_active = TRUE');
    const todayAppointments = await db.query('SELECT COUNT(*)::INT FROM appointments WHERE appointment_date = CURRENT_DATE');
    const totalRevenue = await db.query('SELECT COALESCE(SUM(paid_amount), 0)::NUMERIC AS total FROM bills');

    return res.status(200).json({
      success: true,
      data: {
        totalPatients: patientCount.rows[0].count,
        totalDoctors: doctorCount.rows[0].count,
        todayAppointments: todayAppointments.rows[0].count,
        totalRevenue: parseFloat(totalRevenue.rows[0].total),
      },
    });
  }

  if (role === 'DOCTOR') {
    const doc = await db.query('SELECT id FROM doctors WHERE user_id = $1', [userId]);
    const doctorId = doc.rows[0]?.id;

    const todayAppointments = await db.query(
      'SELECT COUNT(*)::INT FROM appointments WHERE doctor_id = $1 AND appointment_date = CURRENT_DATE',
      [doctorId]
    );
    const totalPatientsSeen = await db.query(
      'SELECT COUNT(DISTINCT patient_id)::INT FROM medical_records WHERE doctor_id = $1',
      [doctorId]
    );

    return res.status(200).json({
      success: true,
      data: {
        todayAppointments: todayAppointments.rows[0]?.count || 0,
        totalPatientsSeen: totalPatientsSeen.rows[0]?.count || 0,
      },
    });
  }

  // Default / Patient view
  const pat = await db.query('SELECT id FROM patients WHERE user_id = $1', [userId]);
  const patientId = pat.rows[0]?.id;

  const upcomingVisits = await db.query(
    "SELECT COUNT(*)::INT FROM appointments WHERE patient_id = $1 AND status IN ('Scheduled', 'Confirmed')",
    [patientId]
  );
  const activePrescriptions = await db.query(
    'SELECT COUNT(*)::INT FROM prescriptions WHERE patient_id = $1',
    [patientId]
  );

  return res.status(200).json({
    success: true,
    data: {
      upcomingVisits: upcomingVisits.rows[0]?.count || 0,
      activePrescriptions: activePrescriptions.rows[0]?.count || 0,
    },
  });
});

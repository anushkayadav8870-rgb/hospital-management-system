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

// @desc    Database Viewer for Admin Teacher Demonstration (Read-Only)
// @route   GET /api/analytics/db-viewer
// @access  Private (ADMIN)
exports.getDatabaseViewer = asyncHandler(async (req, res) => {
  const { table = 'patients' } = req.query;

  let queryText = '';

  switch (table.toLowerCase()) {
    case 'patients':
      queryText = `
        SELECT p.id AS "Patient ID", p.mrn AS "MRN Number",
               u.first_name AS "First Name", u.last_name AS "Last Name",
               u.email AS "Email", u.phone AS "Phone",
               p.date_of_birth::text AS "Date of Birth", p.gender AS "Gender",
               p.blood_group AS "Blood Group", p.created_at AS "Registered At"
        FROM patients p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.id DESC LIMIT 50
      `;
      break;

    case 'doctors':
      queryText = `
        SELECT d.id AS "Doctor ID", 'Dr. ' || u.first_name || ' ' || u.last_name AS "Doctor Name",
               u.email AS "Email", d.specialization AS "Specialization",
               d.qualification AS "Qualification", d.consultation_fee AS "Consultation Fee ($)",
               dept.name AS "Department"
        FROM doctors d
        JOIN users u ON d.user_id = u.id
        LEFT JOIN departments dept ON d.department_id = dept.id
        ORDER BY d.id DESC LIMIT 50
      `;
      break;

    case 'appointments':
      queryText = `
        SELECT a.id AS "Appt ID", pu.first_name || ' ' || pu.last_name AS "Patient",
               'Dr. ' || du.first_name || ' ' || du.last_name AS "Doctor",
               a.appointment_date::text AS "Date", a.appointment_time::text AS "Time",
               a.status AS "Status", a.reason AS "Reason"
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        ORDER BY a.id DESC LIMIT 50
      `;
      break;

    case 'bills':
      queryText = `
        SELECT b.id AS "Bill ID", pu.first_name || ' ' || pu.last_name AS "Patient",
               b.total_amount AS "Total Amount ($)", b.paid_amount AS "Paid Amount ($)",
               b.status AS "Status", b.created_at AS "Created At"
        FROM bills b
        JOIN patients p ON b.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        ORDER BY b.id DESC LIMIT 50
      `;
      break;

    case 'users':
      queryText = `
        SELECT id AS "User ID", email AS "Email", role AS "System Role",
               first_name AS "First Name", last_name AS "Last Name",
               phone AS "Phone Number", is_active AS "Account Active",
               created_at AS "Created At"
        FROM users
        ORDER BY id DESC LIMIT 50
      `;
      break;

    case 'departments':
      queryText = `
        SELECT id AS "Dept ID", name AS "Department Name",
               description AS "Description", location_floor AS "Location Floor"
        FROM departments
        ORDER BY id ASC LIMIT 50
      `;
      break;

    default:
      res.status(400);
      throw new Error('Invalid table requested. Allowed tables: patients, doctors, appointments, bills, users, departments.');
  }

  const result = await db.query(queryText);

  res.status(200).json({
    success: true,
    table: table.toLowerCase(),
    columns: result.fields ? result.fields.map((f) => f.name) : [],
    rowCount: result.rows.length,
    data: result.rows,
  });
});


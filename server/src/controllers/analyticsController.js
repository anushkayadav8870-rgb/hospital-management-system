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

// @desc    Database Explorer for Admin (Read-Only live PostgreSQL inspection)
// @route   GET /api/analytics/db-viewer
// @access  Private (ADMIN)
exports.getDatabaseViewer = asyncHandler(async (req, res) => {
  const { table = 'patients', search = '', limit = 50, page = 1 } = req.query;
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  // Explicit table allowlist
  const allowlistedTables = ['patients', 'doctors', 'appointments', 'bills', 'users', 'departments', 'beds'];
  const requestedTable = table.toLowerCase();

  if (!allowlistedTables.includes(requestedTable)) {
    res.status(400);
    throw new Error(`Invalid table requested. Allowed tables: ${allowlistedTables.join(', ')}.`);
  }

  // 1. Fetch live row counts for all allowlisted tables
  const tableCounts = {};
  for (const t of allowlistedTables) {
    try {
      const countRes = await db.query(`SELECT COUNT(*)::INT FROM ${t}`);
      tableCounts[t] = countRes.rows[0].count;
    } catch {
      tableCounts[t] = 0;
    }
  }

  // 2. Query data for the requested table safely with allowlisted column projections
  let queryText = '';
  const queryParams = [];

  switch (requestedTable) {
    case 'patients':
      if (search) {
        queryParams.push(`%${search}%`);
        queryText = `
          SELECT p.id AS "Patient ID (PK)", p.mrn AS "MRN Number",
                 p.user_id AS "User ID (FK -> users.id)",
                 u.first_name AS "First Name", u.last_name AS "Last Name",
                 u.email AS "Email", u.phone AS "Phone",
                 p.date_of_birth::text AS "Date of Birth", p.gender AS "Gender",
                 p.blood_group AS "Blood Group", p.created_at::text AS "Created At"
          FROM patients p
          LEFT JOIN users u ON p.user_id = u.id
          WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR p.mrn ILIKE $1 OR u.email ILIKE $1
          ORDER BY p.id DESC LIMIT $2 OFFSET $3
        `;
        queryParams.push(parsedLimit, offset);
      } else {
        queryText = `
          SELECT p.id AS "Patient ID (PK)", p.mrn AS "MRN Number",
                 p.user_id AS "User ID (FK -> users.id)",
                 u.first_name AS "First Name", u.last_name AS "Last Name",
                 u.email AS "Email", u.phone AS "Phone",
                 p.date_of_birth::text AS "Date of Birth", p.gender AS "Gender",
                 p.blood_group AS "Blood Group", p.created_at::text AS "Created At"
          FROM patients p
          LEFT JOIN users u ON p.user_id = u.id
          ORDER BY p.id DESC LIMIT $1 OFFSET $2
        `;
        queryParams.push(parsedLimit, offset);
      }
      break;

    case 'doctors':
      if (search) {
        queryParams.push(`%${search}%`);
        queryText = `
          SELECT d.id AS "Doctor ID (PK)", d.user_id AS "User ID (FK -> users.id)",
                 'Dr. ' || u.first_name || ' ' || u.last_name AS "Doctor Name",
                 u.email AS "Email", d.specialization AS "Specialization",
                 d.qualification AS "Qualification", d.consultation_fee::text AS "Consultation Fee ($)",
                 dept.name AS "Department (FK -> departments.name)"
          FROM doctors d
          JOIN users u ON d.user_id = u.id
          LEFT JOIN departments dept ON d.department_id = dept.id
          WHERE u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR d.specialization ILIKE $1
          ORDER BY d.id DESC LIMIT $2 OFFSET $3
        `;
        queryParams.push(parsedLimit, offset);
      } else {
        queryText = `
          SELECT d.id AS "Doctor ID (PK)", d.user_id AS "User ID (FK -> users.id)",
                 'Dr. ' || u.first_name || ' ' || u.last_name AS "Doctor Name",
                 u.email AS "Email", d.specialization AS "Specialization",
                 d.qualification AS "Qualification", d.consultation_fee::text AS "Consultation Fee ($)",
                 dept.name AS "Department (FK -> departments.name)"
          FROM doctors d
          JOIN users u ON d.user_id = u.id
          LEFT JOIN departments dept ON d.department_id = dept.id
          ORDER BY d.id DESC LIMIT $1 OFFSET $2
        `;
        queryParams.push(parsedLimit, offset);
      }
      break;

    case 'appointments':
      queryText = `
        SELECT a.id AS "Appointment ID (PK)",
               a.patient_id AS "Patient ID (FK -> patients.id)",
               pu.first_name || ' ' || pu.last_name AS "Patient Name",
               a.doctor_id AS "Doctor ID (FK -> doctors.id)",
               'Dr. ' || du.first_name || ' ' || du.last_name AS "Doctor Name",
               a.appointment_date::text AS "Date", a.appointment_time::text AS "Time",
               a.status AS "Status", a.reason AS "Reason"
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users du ON d.user_id = du.id
        ORDER BY a.id DESC LIMIT $1 OFFSET $2
      `;
      queryParams.push(parsedLimit, offset);
      break;

    case 'bills':
      queryText = `
        SELECT b.id AS "Bill ID (PK)",
               b.patient_id AS "Patient ID (FK -> patients.id)",
               pu.first_name || ' ' || pu.last_name AS "Patient Name",
               b.total_amount::text AS "Total Amount ($)",
               b.paid_amount::text AS "Paid Amount ($)",
               b.status AS "Payment Status",
               b.created_at::text AS "Created At"
        FROM bills b
        JOIN patients p ON b.patient_id = p.id
        JOIN users pu ON p.user_id = pu.id
        ORDER BY b.id DESC LIMIT $1 OFFSET $2
      `;
      queryParams.push(parsedLimit, offset);
      break;

    case 'users':
      // Security: password_hash is strictly EXCLUDED
      queryText = `
        SELECT id AS "User ID (PK)", email AS "Email", role AS "System Role",
               first_name AS "First Name", last_name AS "Last Name",
               phone AS "Phone", is_active AS "Active",
               created_at::text AS "Created At"
        FROM users
        ORDER BY id DESC LIMIT $1 OFFSET $2
      `;
      queryParams.push(parsedLimit, offset);
      break;

    case 'departments':
      queryText = `
        SELECT id AS "Dept ID (PK)", name AS "Department Name",
               description AS "Description", location_floor AS "Location Floor"
        FROM departments
        ORDER BY id ASC LIMIT $1 OFFSET $2
      `;
      queryParams.push(parsedLimit, offset);
      break;

    case 'beds':
      queryText = `
        SELECT id AS "Bed ID (PK)", bed_number AS "Bed Number",
               ward_type AS "Ward Type", room_number AS "Room",
               daily_rate::text AS "Daily Rate ($)", status AS "Occupancy Status"
        FROM beds
        ORDER BY id ASC LIMIT $1 OFFSET $2
      `;
      queryParams.push(parsedLimit, offset);
      break;
  }

  const result = await db.query(queryText, queryParams);

  res.status(200).json({
    success: true,
    meta: {
      provider: 'Neon Cloud PostgreSQL',
      database: 'neondb',
      serverTime: new Date().toISOString(),
      tableCounts,
    },
    table: requestedTable,
    columns: result.fields ? result.fields.map((f) => f.name) : [],
    rowCount: result.rows.length,
    totalRecords: tableCounts[requestedTable] || 0,
    page: parsedPage,
    limit: parsedLimit,
    data: result.rows,
  });
});


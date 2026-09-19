// =============================================
// server/src/controllers/appointmentController.js
// Appointment Scheduling & Conflict Prevention Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get appointments list with filtering by date/status
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = asyncHandler(async (req, res) => {
  const { date, status, doctorId, patientId } = req.query;

  let queryText = `
    SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason, a.notes, a.created_at,
           p.id AS patient_id, p.mrn, pu.first_name AS patient_first_name, pu.last_name AS patient_last_name, pu.phone AS patient_phone,
           d.id AS doctor_id, d.specialization, d.consultation_fee,
           du.first_name AS doctor_first_name, du.last_name AS doctor_last_name,
           dept.name AS department_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON a.doctor_id = d.id
    LEFT JOIN users du ON d.user_id = du.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE 1=1
  `;

  const queryParams = [];

  if (date) {
    queryParams.push(date);
    queryText += ` AND a.appointment_date = $${queryParams.length}`;
  }

  if (status) {
    queryParams.push(status);
    queryText += ` AND a.status = $${queryParams.length}`;
  }

  if (doctorId) {
    queryParams.push(parseInt(doctorId, 10));
    queryText += ` AND a.doctor_id = $${queryParams.length}`;
  }

  if (patientId) {
    queryParams.push(parseInt(patientId, 10));
    queryText += ` AND a.patient_id = $${queryParams.length}`;
  }

  queryText += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC`;

  const result = await db.query(queryText, queryParams);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((row) => ({
      id: row.id,
      date: row.appointment_date,
      time: row.appointment_time,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      createdAt: row.created_at,
      patient: {
        id: row.patient_id,
        mrn: row.mrn,
        name: `${row.patient_first_name} ${row.patient_last_name}`,
        phone: row.patient_phone,
      },
      doctor: {
        id: row.doctor_id,
        name: `Dr. ${row.doctor_first_name} ${row.doctor_last_name}`,
        specialization: row.specialization,
        department: row.department_name,
        consultationFee: parseFloat(row.consultation_fee),
      },
    })),
  });
});

// @desc    Book a new appointment with conflict check
// @route   POST /api/appointments
// @access  Private (ADMIN, RECEPTIONIST, PATIENT)
exports.bookAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    res.status(400);
    throw new Error('Please provide all required fields (patientId, doctorId, appointmentDate, appointmentTime).');
  }

  // 1. Conflict Prevention Check
  const conflictCheck = await db.query(
    `SELECT id FROM appointments
     WHERE doctor_id = $1
       AND appointment_date = $2
       AND appointment_time = $3
       AND status IN ('Scheduled', 'Confirmed')`,
    [doctorId, appointmentDate, appointmentTime]
  );

  if (conflictCheck.rows.length > 0) {
    res.status(400);
    throw new Error('Scheduling Conflict: The selected doctor already has an active appointment at this date and time.');
  }

  // 2. Insert new appointment
  const result = await db.query(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason)
     VALUES ($1, $2, $3, $4, 'Scheduled', $5)
     RETURNING id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, created_at`,
    [patientId, doctorId, appointmentDate, appointmentTime, reason || 'General Consultation']
  );

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully.',
    data: result.rows[0],
  });
});

// @desc    Update appointment status (Scheduled -> Confirmed -> Completed / Cancelled / No-Show)
// @route   PATCH /api/appointments/:id/status
// @access  Private (ADMIN, DOCTOR, RECEPTIONIST)
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
  }

  const result = await db.query(
    `UPDATE appointments
     SET status = $1,
         notes  = COALESCE($2, notes)
     WHERE id = $3
     RETURNING *`,
    [status, notes || null, id]
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error(`Appointment with ID ${id} not found.`);
  }

  res.status(200).json({
    success: true,
    message: `Appointment status updated to '${status}'.`,
    data: result.rows[0],
  });
});

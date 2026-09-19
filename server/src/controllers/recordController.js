// =============================================
// server/src/controllers/recordController.js
// Electronic Medical Records (EMR) Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get all medical records (Filtered by role)
// @route   GET /api/records
// @access  Private (ADMIN, DOCTOR, PATIENT)
exports.getMedicalRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.query;

  let queryText = `
    SELECT mr.id, mr.symptoms, mr.diagnosis, mr.treatment_plan, mr.doctor_notes, mr.created_at,
           p.id AS patient_id, p.mrn, pu.first_name AS patient_first_name, pu.last_name AS patient_last_name,
           d.id AS doctor_id, d.specialization, du.first_name AS doctor_first_name, du.last_name AS doctor_last_name,
           a.id AS appointment_id, a.appointment_date
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    LEFT JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON mr.doctor_id = d.id
    LEFT JOIN users du ON d.user_id = du.id
    LEFT JOIN appointments a ON mr.appointment_id = a.id
    WHERE 1=1
  `;

  const queryParams = [];

  // PATIENT role can ONLY view their own records
  if (req.user.role === 'PATIENT') {
    queryParams.push(req.user.id);
    queryText += ` AND p.user_id = $${queryParams.length}`;
  } else if (patientId) {
    queryParams.push(parseInt(patientId, 10));
    queryText += ` AND mr.patient_id = $${queryParams.length}`;
  }

  queryText += ` ORDER BY mr.created_at DESC`;

  const result = await db.query(queryText, queryParams);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((row) => ({
      id: row.id,
      symptoms: row.symptoms,
      diagnosis: row.diagnosis,
      treatmentPlan: row.treatment_plan,
      doctorNotes: row.doctor_notes,
      createdAt: row.created_at,
      appointmentId: row.appointment_id,
      appointmentDate: row.appointment_date,
      patient: {
        id: row.patient_id,
        mrn: row.mrn,
        name: `${row.patient_first_name} ${row.patient_last_name}`,
      },
      doctor: {
        id: row.doctor_id,
        name: `Dr. ${row.doctor_first_name} ${row.doctor_last_name}`,
        specialization: row.specialization,
      },
    })),
  });
});

// @desc    Get single EMR record by ID
// @route   GET /api/records/:id
// @access  Private
exports.getRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT mr.id, mr.symptoms, mr.diagnosis, mr.treatment_plan, mr.doctor_notes, mr.created_at,
            p.id AS patient_id, p.mrn, pu.first_name AS patient_first_name, pu.last_name AS patient_last_name,
            d.id AS doctor_id, d.specialization, du.first_name AS doctor_first_name, du.last_name AS doctor_last_name
     FROM medical_records mr
     JOIN patients p ON mr.patient_id = p.id
     LEFT JOIN users pu ON p.user_id = pu.id
     JOIN doctors d ON mr.doctor_id = d.id
     LEFT JOIN users du ON d.user_id = du.id
     WHERE mr.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error(`Medical record with ID ${id} not found.`);
  }

  const row = result.rows[0];

  res.status(200).json({
    success: true,
    data: {
      id: row.id,
      symptoms: row.symptoms,
      diagnosis: row.diagnosis,
      treatmentPlan: row.treatment_plan,
      doctorNotes: row.doctor_notes,
      createdAt: row.created_at,
      patient: {
        id: row.patient_id,
        mrn: row.mrn,
        name: `${row.patient_first_name} ${row.patient_last_name}`,
      },
      doctor: {
        id: row.doctor_id,
        name: `Dr. ${row.doctor_first_name} ${row.doctor_last_name}`,
        specialization: row.specialization,
      },
    },
  });
});

// @desc    Create a new clinical medical record
// @route   POST /api/records
// @access  Private (ADMIN, DOCTOR)
exports.createMedicalRecord = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentId, symptoms, diagnosis, treatmentPlan, doctorNotes } = req.body;

  if (!patientId || !doctorId || !symptoms || !diagnosis) {
    res.status(400);
    throw new Error('Please provide all required fields (patientId, doctorId, symptoms, diagnosis).');
  }

  const result = await db.query(
    `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment_plan, doctor_notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, patient_id, doctor_id, appointment_id, symptoms, diagnosis, treatment_plan, doctor_notes, created_at`,
    [patientId, doctorId, appointmentId || null, symptoms, diagnosis, treatmentPlan || null, doctorNotes || null]
  );

  // Auto-update appointment status to 'Completed' if appointmentId provided
  if (appointmentId) {
    await db.query(`UPDATE appointments SET status = 'Completed' WHERE id = $1`, [appointmentId]);
  }

  res.status(201).json({
    success: true,
    message: 'Medical record created successfully.',
    data: result.rows[0],
  });
});

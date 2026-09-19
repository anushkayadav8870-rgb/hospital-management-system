// =============================================
// server/src/controllers/prescriptionController.js
// Prescriptions Management Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get all prescriptions with items
// @route   GET /api/prescriptions
// @access  Private
exports.getPrescriptions = asyncHandler(async (req, res) => {
  const { patientId } = req.query;

  let queryText = `
    SELECT pr.id, pr.instructions, pr.created_at,
           p.id AS patient_id, p.mrn, pu.first_name AS patient_first_name, pu.last_name AS patient_last_name,
           d.id AS doctor_id, d.specialization, du.first_name AS doctor_first_name, du.last_name AS doctor_last_name
    FROM prescriptions pr
    JOIN patients p ON pr.patient_id = p.id
    LEFT JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON pr.doctor_id = d.id
    LEFT JOIN users du ON d.user_id = du.id
    WHERE 1=1
  `;

  const queryParams = [];

  if (req.user.role === 'PATIENT') {
    queryParams.push(req.user.id);
    queryText += ` AND p.user_id = $${queryParams.length}`;
  } else if (patientId) {
    queryParams.push(parseInt(patientId, 10));
    queryText += ` AND pr.patient_id = $${queryParams.length}`;
  }

  queryText += ` ORDER BY pr.created_at DESC`;

  const result = await db.query(queryText, queryParams);
  const prescriptions = result.rows;

  // Fetch items for each prescription
  for (const rx of prescriptions) {
    const itemsResult = await db.query(
      `SELECT id, medicine_name, dosage, frequency, duration
       FROM prescription_items
       WHERE prescription_id = $1`,
      [rx.id]
    );
    rx.items = itemsResult.rows;
  }

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions.map((row) => ({
      id: row.id,
      instructions: row.instructions,
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
      items: row.items.map((i) => ({
        id: i.id,
        medicineName: i.medicine_name,
        dosage: i.dosage,
        frequency: i.frequency,
        duration: i.duration,
      })),
    })),
  });
});

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rxResult = await db.query(
    `SELECT pr.id, pr.instructions, pr.created_at,
            p.id AS patient_id, p.mrn, pu.first_name AS patient_first_name, pu.last_name AS patient_last_name,
            d.id AS doctor_id, d.specialization, du.first_name AS doctor_first_name, du.last_name AS doctor_last_name
     FROM prescriptions pr
     JOIN patients p ON pr.patient_id = p.id
     LEFT JOIN users pu ON p.user_id = pu.id
     JOIN doctors d ON pr.doctor_id = d.id
     LEFT JOIN users du ON d.user_id = du.id
     WHERE pr.id = $1`,
    [id]
  );

  if (rxResult.rows.length === 0) {
    res.status(404);
    throw new Error(`Prescription record with ID ${id} not found.`);
  }

  const row = rxResult.rows[0];

  const itemsResult = await db.query(
    `SELECT id, medicine_name, dosage, frequency, duration
     FROM prescription_items
     WHERE prescription_id = $1`,
    [id]
  );

  res.status(200).json({
    success: true,
    data: {
      id: row.id,
      instructions: row.instructions,
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
      items: itemsResult.rows.map((i) => ({
        id: i.id,
        medicineName: i.medicine_name,
        dosage: i.dosage,
        frequency: i.frequency,
        duration: i.duration,
      })),
    },
  });
});

// @desc    Create prescription with medication items (Atomic Transaction)
// @route   POST /api/prescriptions
// @access  Private (ADMIN, DOCTOR)
exports.createPrescription = asyncHandler(async (req, res) => {
  const { patientId, doctorId, medicalRecordId, instructions, items } = req.body;

  if (!patientId || !doctorId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Please provide patientId, doctorId, and at least one medication item.');
  }

  const client = await db.pool.connect();

  try {
    // BEGIN SQL Transaction
    await client.query('BEGIN');

    // 1. Insert master prescription
    const rxResult = await client.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medical_record_id, instructions)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [patientId, doctorId, medicalRecordId || null, instructions || null]
    );

    const prescriptionId = rxResult.rows[0].id;

    // 2. Insert detail items
    for (const item of items) {
      if (!item.medicineName || !item.dosage || !item.frequency) {
        throw new Error('Each medicine item must specify medicineName, dosage, and frequency.');
      }

      await client.query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration)
         VALUES ($1, $2, $3, $4, $5)`,
        [prescriptionId, item.medicineName, item.dosage, item.frequency, item.duration || '7 days']
      );
    }

    // COMMIT SQL Transaction
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully.',
      data: {
        id: prescriptionId,
        patientId,
        doctorId,
        itemCount: items.length,
        createdAt: rxResult.rows[0].created_at,
      },
    });
  } catch (err) {
    // ROLLBACK transaction on error
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

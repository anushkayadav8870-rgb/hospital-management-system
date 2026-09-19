// =============================================
// server/src/controllers/doctorController.js
// Doctor Management Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');
const bcrypt = require('bcryptjs');

// @desc    Get all doctors with department & schedule details
// @route   GET /api/doctors
// @access  Private
exports.getDoctors = asyncHandler(async (req, res) => {
  const { departmentId, search } = req.query;

  let queryText = `
    SELECT d.id, d.specialization, d.qualification, d.consultation_fee, d.bio, d.created_at,
           u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.is_active,
           dept.id AS department_id, dept.name AS department_name, dept.location_floor
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN departments dept ON d.department_id = dept.id
    WHERE u.is_active = TRUE
  `;

  const queryParams = [];

  if (departmentId) {
    queryParams.push(parseInt(departmentId, 10));
    queryText += ` AND d.department_id = $${queryParams.length}`;
  }

  if (search) {
    queryParams.push(`%${search}%`);
    queryText += ` AND (u.first_name ILIKE $${queryParams.length} OR u.last_name ILIKE $${queryParams.length} OR d.specialization ILIKE $${queryParams.length})`;
  }

  queryText += ` ORDER BY u.last_name ASC`;

  const result = await db.query(queryText, queryParams);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: `Dr. ${row.first_name} ${row.last_name}`,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      specialization: row.specialization,
      qualification: row.qualification,
      consultationFee: parseFloat(row.consultation_fee),
      bio: row.bio,
      department: row.department_name
        ? {
            id: row.department_id,
            name: row.department_name,
            locationFloor: row.location_floor,
          }
        : null,
      isActive: row.is_active,
      createdAt: row.created_at,
    })),
  });
});

// @desc    Get single doctor profile & schedule by ID
// @route   GET /api/doctors/:id
// @access  Private
exports.getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctorResult = await db.query(
    `SELECT d.id, d.specialization, d.qualification, d.consultation_fee, d.bio, d.created_at,
            u.id AS user_id, u.first_name, u.last_name, u.email, u.phone, u.is_active,
            dept.id AS department_id, dept.name AS department_name, dept.location_floor
     FROM doctors d
     JOIN users u ON d.user_id = u.id
     LEFT JOIN departments dept ON d.department_id = dept.id
     WHERE d.id = $1`,
    [id]
  );

  if (doctorResult.rows.length === 0) {
    res.status(404);
    throw new Error(`Doctor profile with ID ${id} not found.`);
  }

  const row = doctorResult.rows[0];

  // Fetch doctor weekly schedule
  const scheduleResult = await db.query(
    `SELECT id, day_of_week, start_time, end_time, max_patients
     FROM doctor_schedules
     WHERE doctor_id = $1
     ORDER BY CASE day_of_week
       WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
       WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
       WHEN 'Sunday' THEN 7 ELSE 8 END`,
    [id]
  );

  res.status(200).json({
    success: true,
    data: {
      id: row.id,
      userId: row.user_id,
      name: `Dr. ${row.first_name} ${row.last_name}`,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      specialization: row.specialization,
      qualification: row.qualification,
      consultationFee: parseFloat(row.consultation_fee),
      bio: row.bio,
      department: row.department_name
        ? {
            id: row.department_id,
            name: row.department_name,
            locationFloor: row.location_floor,
          }
        : null,
      schedules: scheduleResult.rows,
      isActive: row.is_active,
      createdAt: row.created_at,
    },
  });
});

// @desc    Register / Add a new doctor profile
// @route   POST /api/doctors
// @access  Private (ADMIN)
exports.createDoctor = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, departmentId, specialization, qualification, consultationFee, bio } = req.body;

  if (!firstName || !lastName || !email || !specialization || !qualification) {
    res.status(400);
    throw new Error('Please provide required fields (firstName, lastName, email, specialization, qualification).');
  }

  // Check email collision
  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    res.status(400);
    throw new Error('An account with this email address already exists.');
  }

  // 1. Create user account with DOCTOR role
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password || 'doctor123', salt);

  const userResult = await db.query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
     VALUES ($1, $2, 'DOCTOR', $3, $4, $5)
     RETURNING id`,
    [email.toLowerCase(), passwordHash, firstName, lastName, phone || null]
  );

  const userId = userResult.rows[0].id;

  // 2. Insert doctor profile
  const doctorResult = await db.query(
    `INSERT INTO doctors (user_id, department_id, specialization, qualification, consultation_fee, bio)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, specialization, qualification, consultation_fee, bio, created_at`,
    [userId, departmentId || null, specialization, qualification, consultationFee || 100.00, bio || null]
  );

  const doc = doctorResult.rows[0];

  res.status(201).json({
    success: true,
    message: 'Doctor profile created successfully.',
    data: {
      id: doc.id,
      userId,
      name: `Dr. ${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone,
      specialization: doc.specialization,
      qualification: doc.qualification,
      consultationFee: parseFloat(doc.consultation_fee),
      bio: doc.bio,
      createdAt: doc.created_at,
    },
  });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (ADMIN, DOCTOR)
exports.updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, departmentId, specialization, qualification, consultationFee, bio } = req.body;

  const existing = await db.query('SELECT id, user_id FROM doctors WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error(`Doctor profile with ID ${id} not found.`);
  }

  const userId = existing.rows[0].user_id;

  // 1. Update user names/phone
  if (firstName || lastName || phone) {
    await db.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name  = COALESCE($2, last_name),
           phone      = COALESCE($3, phone)
       WHERE id = $4`,
      [firstName, lastName, phone, userId]
    );
  }

  // 2. Update doctor fields
  const updatedResult = await db.query(
    `UPDATE doctors
     SET department_id    = COALESCE($1, department_id),
         specialization   = COALESCE($2, specialization),
         qualification    = COALESCE($3, qualification),
         consultation_fee = COALESCE($4, consultation_fee),
         bio              = COALESCE($5, bio)
     WHERE id = $6
     RETURNING *`,
    [departmentId, specialization, qualification, consultationFee, bio, id]
  );

  res.status(200).json({
    success: true,
    message: 'Doctor profile updated successfully.',
    data: updatedResult.rows[0],
  });
});

// @desc    Deactivate doctor account
// @route   PATCH /api/doctors/:id/deactivate
// @access  Private (ADMIN)
exports.deactivateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await db.query('SELECT user_id FROM doctors WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error(`Doctor profile with ID ${id} not found.`);
  }

  const userId = existing.rows[0].user_id;
  await db.query('UPDATE users SET is_active = FALSE WHERE id = $1', [userId]);

  res.status(200).json({
    success: true,
    message: 'Doctor account deactivated successfully.',
  });
});

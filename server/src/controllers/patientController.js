// =============================================
// server/src/controllers/patientController.js
// Patient Management Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');
const {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidDOB,
  isValidGender,
  isValidBloodGroup,
} = require('../utils/validators');

// Helper function to auto-generate unique Medical Record Number (MRN)
function generateMRN() {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `PAT-${year}-${randomDigits}`;
}

// @desc    Get all patients with search filtering & pagination
// @route   GET /api/patients
// @access  Private (ADMIN, DOCTOR, RECEPTIONIST)
exports.getPatients = asyncHandler(async (req, res) => {
  const { search, limit = 50, page = 1 } = req.query;
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  let queryText = `
    SELECT p.id, p.mrn, p.date_of_birth, p.gender, p.blood_group,
           p.emergency_contact, p.address, p.created_at,
           u.first_name, u.last_name, u.email, u.phone, u.is_active
    FROM patients p
    LEFT JOIN users u ON p.user_id = u.id
  `;

  const queryParams = [];

  // Filter by search string if provided
  if (search) {
    queryText += `
      WHERE u.first_name ILIKE $1 
         OR u.last_name ILIKE $1 
         OR p.mrn ILIKE $1 
         OR u.phone ILIKE $1
    `;
    queryParams.push(`%${search}%`);
  }

  queryText += ` ORDER BY p.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  queryParams.push(parseInt(limit, 10), offset);

  const result = await db.query(queryText, queryParams);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((row) => ({
      id: row.id,
      mrn: row.mrn,
      name: row.first_name ? `${row.first_name} ${row.last_name}` : 'Unlinked Patient',
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      dob: row.date_of_birth,
      gender: row.gender,
      bloodGroup: row.blood_group,
      emergencyContact: row.emergency_contact,
      address: row.address,
      isActive: row.is_active,
      createdAt: row.created_at,
    })),
  });
});

// @desc    Get single patient details by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT p.id, p.mrn, p.date_of_birth, p.gender, p.blood_group,
            p.emergency_contact, p.address, p.created_at,
            u.first_name, u.last_name, u.email, u.phone, u.is_active
     FROM patients p
     LEFT JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error(`Patient record with ID ${id} not found.`);
  }

  const row = result.rows[0];

  res.status(200).json({
    success: true,
    data: {
      id: row.id,
      mrn: row.mrn,
      name: row.first_name ? `${row.first_name} ${row.last_name}` : 'Unlinked Patient',
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      dob: row.date_of_birth,
      gender: row.gender,
      bloodGroup: row.blood_group,
      emergencyContact: row.emergency_contact,
      address: row.address,
      isActive: row.is_active,
      createdAt: row.created_at,
    },
  });
});

// @desc    Create / Register a new patient
// @route   POST /api/patients
// @access  Private (ADMIN, RECEPTIONIST)
exports.createPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, dob, gender, bloodGroup, emergencyContact, address } = req.body;

  // Required Field Checks
  if (!firstName || !lastName || !dob || !gender) {
    res.status(400);
    throw new Error('Please provide required fields (First Name, Last Name, Date of Birth, Gender).');
  }

  // Name Validation
  if (!isValidName(firstName)) {
    res.status(400);
    throw new Error('First Name must contain only alphabetic characters, spaces, or hyphens (2-50 characters) and no numbers or symbols.');
  }
  if (!isValidName(lastName)) {
    res.status(400);
    throw new Error('Last Name must contain only alphabetic characters, spaces, or hyphens (2-50 characters) and no numbers or symbols.');
  }

  // Email Validation
  if (email && !isValidEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address (e.g. patient@email.com).');
  }

  // Phone Validation
  if (phone && !isValidPhone(phone)) {
    res.status(400);
    throw new Error('Please provide a valid phone number (7-15 digits).');
  }

  // Date of Birth Validation
  if (!isValidDOB(dob)) {
    res.status(400);
    throw new Error('Date of Birth must be a valid past date within the last 120 years (future dates are not allowed).');
  }

  // Gender & Blood Group Validation
  if (!isValidGender(gender)) {
    res.status(400);
    throw new Error('Gender must be Female, Male, or Other.');
  }
  if (bloodGroup && !isValidBloodGroup(bloodGroup)) {
    res.status(400);
    throw new Error('Invalid blood group specified.');
  }

  // Check email collision if email provided
  if (email) {
    const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingEmail.rows.length > 0) {
      res.status(400);
      throw new Error('An account with this email address already exists.');
    }
  }

  // 1. Create associated user account for patient login
  const generatedEmail = email || `patient_${Date.now()}@pulsecare.local`;
  const defaultPasswordHash = '$2b$10$By9Nsp9DIt2tfCgjP1gye.tk.Y55ElAah4K7Oyh0B1ICeWPr1BNWS'; // password123

  const userResult = await db.query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
     VALUES ($1, $2, 'PATIENT', $3, $4, $5)
     RETURNING id`,
    [generatedEmail.toLowerCase(), defaultPasswordHash, firstName.trim(), lastName.trim(), phone ? phone.trim() : null]
  );

  const userId = userResult.rows[0].id;
  const mrn = generateMRN();

  // 2. Insert patient record
  const patientResult = await db.query(
    `INSERT INTO patients (user_id, mrn, date_of_birth, gender, blood_group, emergency_contact, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, mrn, date_of_birth, gender, blood_group, emergency_contact, address, created_at`,
    [userId, mrn, dob, gender, bloodGroup || 'Unknown', emergencyContact ? emergencyContact.trim() : null, address ? address.trim() : null]
  );

  const p = patientResult.rows[0];

  res.status(201).json({
    success: true,
    message: 'Patient registered successfully.',
    data: {
      id: p.id,
      mrn: p.mrn,
      name: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: generatedEmail,
      phone,
      dob: p.date_of_birth,
      gender: p.gender,
      bloodGroup: p.blood_group,
      emergencyContact: p.emergency_contact,
      address: p.address,
      isActive: true,
      createdAt: p.created_at,
    },
  });
});


// @desc    Update patient profile details
// @route   PUT /api/patients/:id
// @access  Private (ADMIN, RECEPTIONIST)
exports.updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, dob, gender, bloodGroup, emergencyContact, address } = req.body;

  // Check if patient exists
  const existing = await db.query('SELECT id, user_id FROM patients WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error(`Patient record with ID ${id} not found.`);
  }

  const userId = existing.rows[0].user_id;

  // 1. Update User names and phone
  if (userId && (firstName || lastName || phone)) {
    await db.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name  = COALESCE($2, last_name),
           phone      = COALESCE($3, phone)
       WHERE id = $4`,
      [firstName, lastName, phone, userId]
    );
  }

  // 2. Update Patient demographics
  const updatedResult = await db.query(
    `UPDATE patients
     SET date_of_birth     = COALESCE($1, date_of_birth),
         gender            = COALESCE($2, gender),
         blood_group       = COALESCE($3, blood_group),
         emergency_contact = COALESCE($4, emergency_contact),
         address           = COALESCE($5, address)
     WHERE id = $6
     RETURNING *`,
    [dob, gender, bloodGroup, emergencyContact, address, id]
  );

  res.status(200).json({
    success: true,
    message: 'Patient profile updated successfully.',
    data: updatedResult.rows[0],
  });
});

// @desc    Deactivate patient record (Soft Delete)
// @route   PATCH /api/patients/:id/deactivate
// @access  Private (ADMIN)
exports.deactivatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await db.query('SELECT user_id FROM patients WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    res.status(404);
    throw new Error(`Patient record with ID ${id} not found.`);
  }

  const userId = existing.rows[0].user_id;
  if (userId) {
    await db.query('UPDATE users SET is_active = FALSE WHERE id = $1', [userId]);
  }

  res.status(200).json({
    success: true,
    message: 'Patient account deactivated successfully.',
  });
});

// =============================================
// server/src/controllers/authController.js
// Authentication & User Profile Controller
// =============================================

const bcrypt = require('bcryptjs');
const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res) => {
  const { email, password, role, firstName, lastName, phone } = req.body;

  // 1. Validation
  if (!email || !password || !firstName || !lastName) {
    res.status(400);
    throw new Error('Please provide all required fields (email, password, firstName, lastName).');
  }

  // 2. Check if user already exists
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existingUser.rows.length > 0) {
    res.status(400);
    throw new Error('An account with this email address already exists.');
  }

  // 3. Hash Password using bcrypt
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Default role to PATIENT if not specified
  const userRole = role || 'PATIENT';

  // 4. Insert into database
  const newUserResult = await db.query(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, role, first_name, last_name, phone, created_at`,
    [email.toLowerCase(), passwordHash, userRole, firstName, lastName, phone || null]
  );

  const user = newUserResult.rows[0];

  // 5. Generate JWT Token
  const token = generateToken(user.id, user.role);

  res.status(201).json({
    success: true,
    message: 'User account registered successfully.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
      token,
    },
  });
});

// @desc    Authenticate user & return JWT token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password.');
  }

  // Fetch user including password_hash
  const userResult = await db.query(
    'SELECT id, email, password_hash, role, first_name, last_name, phone, is_active FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (userResult.rows.length === 0) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const user = userResult.rows[0];

  if (!user.is_active) {
    res.status(401);
    throw new Error('Account has been deactivated. Please contact hospital administrator.');
  }

  // Compare submitted password against stored hash using bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  // Generate JWT token
  const token = generateToken(user.id, user.role);

  res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        initials: `${user.first_name[0]}${user.last_name[0]}`.toUpperCase(),
      },
      token,
    },
  });
});

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private (Protected)
exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        initials: `${user.first_name[0]}${user.last_name[0]}`.toUpperCase(),
      },
    },
  });
});

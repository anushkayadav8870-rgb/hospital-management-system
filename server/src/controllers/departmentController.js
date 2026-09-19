// =============================================
// server/src/controllers/departmentController.js
// Department Management Controller
// =============================================

const asyncHandler = require('../middleware/asyncHandler');
const db = require('../db');

// @desc    Get all departments with active doctor count
// @route   GET /api/departments
// @access  Private
exports.getDepartments = asyncHandler(async (_req, res) => {
  const result = await db.query(`
    SELECT dept.id, dept.name, dept.description, dept.location_floor, dept.created_at,
           COUNT(d.id)::INT AS doctor_count
    FROM departments dept
    LEFT JOIN doctors d ON dept.id = d.department_id
    GROUP BY dept.id
    ORDER BY dept.name ASC
  `);

  res.status(200).json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      locationFloor: row.location_floor,
      doctorCount: row.doctor_count,
      createdAt: row.created_at,
    })),
  });
});

// @desc    Create a new hospital department
// @route   POST /api/departments
// @access  Private (ADMIN)
exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, description, locationFloor } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Department name is required.');
  }

  const existing = await db.query('SELECT id FROM departments WHERE name ILIKE $1', [name]);
  if (existing.rows.length > 0) {
    res.status(400);
    throw new Error(`Department '${name}' already exists.`);
  }

  const result = await db.query(
    `INSERT INTO departments (name, description, location_floor)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, location_floor, created_at`,
    [name, description || null, locationFloor || null]
  );

  res.status(201).json({
    success: true,
    message: 'Department created successfully.',
    data: result.rows[0],
  });
});

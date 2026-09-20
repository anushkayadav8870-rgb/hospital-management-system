// =============================================
// server/src/server.js
// Main entry point for the Express API server
// =============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const recordRoutes = require('./routes/recordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();

// -----------------------------------------------
// Global Middleware Pipeline
// -----------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Request Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// -----------------------------------------------
// API Routes
// -----------------------------------------------
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/bills', billingRoutes);

// -----------------------------------------------
// Error Handling Pipeline
// -----------------------------------------------
app.use(notFound);      // 404 Not Found Handler
app.use(errorHandler);  // Global Exception Handler

// -----------------------------------------------
// Server Initialization
// -----------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  PulseCare HMS — API Server Operational');
  console.log('==============================================');
  console.log(`  Health   : http://localhost:${PORT}/api/health`);
  console.log(`  Billing  : http://localhost:${PORT}/api/bills`);
  console.log(`  Env      : ${process.env.NODE_ENV || 'development'}`);
  console.log('==============================================');
});

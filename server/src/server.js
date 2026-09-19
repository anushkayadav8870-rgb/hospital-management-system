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
  console.log(`  URL  : http://localhost:${PORT}/api/health`);
  console.log(`  Env  : ${process.env.NODE_ENV || 'development'}`);
  console.log('==============================================');
});

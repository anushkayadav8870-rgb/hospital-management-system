// =============================================
// server/src/routes/healthRoutes.js
// Health-check endpoint to verify the server is running
// =============================================

const express = require("express");

// A Router is a mini Express application — it groups related routes.
// We export it and mount it in server.js under a prefix (e.g., /api).
const router = express.Router();

// -----------------------------------------------
// GET /api/health
// -----------------------------------------------
// Purpose: Verify the API server is online and responding.
// This is the first route we build in every backend project.
// It lets us confirm the server is working BEFORE we connect
// to a database or build complex features.
//
// HTTP Method: GET (we are GETting information, not sending data)
// Path: /health (mounted under /api in server.js → full path: /api/health)
// Auth Required: No (this is a public status endpoint)
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PulseCare HMS API is running.",
    data: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    },
  });
});

module.exports = router;

// =============================================
// server/src/server.js
// Main entry point for the Express API server
// =============================================

// 1. Load environment variables from .env FIRST
//    (must be before any other imports that use process.env)
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import our route files (we'll add more routes in later phases)
const healthRoutes = require("./routes/healthRoutes");

// -----------------------------------------------
// Create the Express application instance
// -----------------------------------------------
// Think of "app" as the entire server configuration object.
// We build it up by attaching middleware and routes.
const app = express();

// -----------------------------------------------
// MIDDLEWARE SETUP
// -----------------------------------------------
// Middleware = functions that run on EVERY request,
// in order, before the final route handler runs.
// Think of it as a pipeline of processing steps.

// 1. CORS (Cross-Origin Resource Sharing)
//    Without this, the browser would BLOCK our React app
//    from calling the API because they run on different ports
//    (React: 5173, API: 5000). This middleware tells the browser
//    "Yes, requests from our client URL are trusted."
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// 2. JSON Body Parser
//    When the React frontend sends data (e.g. a new patient form),
//    it sends it as a JSON string in the request body.
//    This middleware parses that JSON string into a real
//    JavaScript object accessible via req.body.
app.use(express.json());

// 3. Simple Request Logger (for learning / debugging)
//    Every time a request hits the server, this logs it to the console.
//    Format: [TIMESTAMP] METHOD /path
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  // next() passes control to the next middleware or route handler.
  // Without calling next(), the request would hang forever.
  next();
});

// -----------------------------------------------
// ROUTES
// -----------------------------------------------
// Routes map URL paths to handler functions.
// We prefix all our API routes with /api for clarity.

app.use("/api", healthRoutes);

// -----------------------------------------------
// 404 CATCH-ALL (Unknown routes)
// -----------------------------------------------
// If a request reaches here, no route above matched it.
// We send back a clean 404 JSON response instead of Express's
// default HTML error page.
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Check the URL and HTTP method.",
  });
});

// -----------------------------------------------
// GLOBAL ERROR HANDLER
// -----------------------------------------------
// If any route or middleware calls next(error), it lands here.
// The 4-parameter signature (err, req, res, next) is what tells
// Express this is an error-handling middleware.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// -----------------------------------------------
// START LISTENING
// -----------------------------------------------
// Read port from .env (defaults to 5000 if not set)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("==============================================");
  console.log("  PulseCare HMS — API Server");
  console.log("==============================================");
  console.log(`  Status  : Running`);
  console.log(`  Port    : ${PORT}`);
  console.log(`  Env     : ${process.env.NODE_ENV}`);
  console.log(`  URL     : http://localhost:${PORT}`);
  console.log("==============================================");
});

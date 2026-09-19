// =============================================
// server/src/db/index.js
// PostgreSQL Connection Pool Setup
// =============================================
// CONCEPT: Connection Pooling
// Creating a new database connection for every single HTTP request
// is expensive and slow (takes tens of milliseconds to handshake TCP/TLS).
//
// A "Pool" maintains a re-usable collection of open database connections.
// When an API route needs to execute a query:
//   1. It borrows a connection from the pool.
//   2. Executes the parameterized SQL query.
//   3. Automatically returns the connection back to the pool.
// =============================================

const { Pool } = require('pg');

// Initialize Pool with environment configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'hms_db',
  user: process.env.DB_USER || 'hms_user',
  password: process.env.DB_PASSWORD || 'hms_password',
  max: 20, // Maximum number of open connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 sec
  connectionTimeoutMillis: 2000, // Return error if connection takes > 2 sec
});

// Event listener: Log unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL Pool Error:', err.message);
});

// Helper export function: query wrapper for parameterized SQL execution
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

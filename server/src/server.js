// =============================================
// server/src/server.js
// Main HTTP Listener entry point
// =============================================

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  CareSync HMS — API Server Operational');
  console.log('==============================================');
  console.log(`  Health    : http://localhost:${PORT}/api/health`);
  console.log(`  Analytics : http://localhost:${PORT}/api/analytics/dashboard`);
  console.log(`  Env       : ${process.env.NODE_ENV || 'development'}`);
  console.log('==============================================');
});

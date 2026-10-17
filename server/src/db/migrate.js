// =============================================
// server/src/db/migrate.js
// Migration Runner for PostgreSQL
// =============================================

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('./index');

async function runMigration() {
  console.log('--- Starting Database Migration 001 ---');
  const migrationFile = path.join(__dirname, 'migrations', '001_expand_schema.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  // Split commands while keeping transactions safe
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL successfully.');
    
    // In PostgreSQL, ALTER TYPE ... ADD VALUE cannot run inside a multi-command transaction block in some versions
    // We execute ALTER TYPE statements individually outside transaction block
    const lines = sql.split(';');
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      console.log(`Executing SQL: ${trimmed.substring(0, 60).replace(/\n/g, ' ')}...`);
      await client.query(trimmed);
    }
    console.log('✅ Migration 001 applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

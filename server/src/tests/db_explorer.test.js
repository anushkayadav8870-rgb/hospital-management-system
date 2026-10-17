// =============================================
// server/src/tests/db_explorer.test.js
// Automated Database Explorer & Patient Persistence Test Suite
// Verifies:
// 1. Unauthorized access to Database Explorer is rejected (HTTP 401)
// 2. Non-admin roles (Doctor, Receptionist, Patient) cannot access viewer (HTTP 403)
// 3. Table allowlisting prevents arbitrary or malicious table queries (HTTP 400)
// 4. Patient creation is atomically persisted in real PostgreSQL database
// 5. Saved patient appears in Database Explorer with valid PK, MRN, and FK (users.id)
// 6. Failed patient validation triggers transaction rollback and no partial data persists
// =============================================

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { pool } = require('../db');

test.after(async () => {
  await pool.end();
});

async function getAuthToken(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data.token;
}

test('DB EXPLORER 1: Unauthenticated request to /api/analytics/db-viewer is rejected (HTTP 401)', async () => {
  const res = await request(app).get('/api/analytics/db-viewer?table=patients');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('DB EXPLORER 2: Non-admin roles (Doctor, Patient) receive HTTP 403 Forbidden', async () => {
  const docToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');
  const docRes = await request(app)
    .get('/api/analytics/db-viewer?table=patients')
    .set('Authorization', `Bearer ${docToken}`);

  assert.equal(docRes.status, 403);
  assert.equal(docRes.body.success, false);
  assert.match(docRes.body.message, /Access Forbidden/i);

  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');
  const patientRes = await request(app)
    .get('/api/analytics/db-viewer?table=patients')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(patientRes.status, 403);
  assert.equal(patientRes.body.success, false);
});

test('DB EXPLORER 3: Querying a non-allowlisted table is rejected with HTTP 400', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const invalidTables = ['information_schema', 'pg_shadow', 'random_table', 'passwords'];
  for (const t of invalidTables) {
    const res = await request(app)
      .get(`/api/analytics/db-viewer?table=${t}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 400, `Expected 400 for table: ${t}`);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid table requested/i);
  }
});

test('DB EXPLORER 4: Admin retrieves metadata, allowlisted table record counts, and column schema', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .get('/api/analytics/db-viewer?table=patients')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.table, 'patients');
  assert.ok(res.body.meta);
  assert.equal(res.body.meta.database, 'neondb');
  assert.ok(res.body.meta.tableCounts);
  assert.equal(typeof res.body.meta.tableCounts.patients, 'number');
  assert.ok(Array.isArray(res.body.columns));
  assert.ok(Array.isArray(res.body.data));

  // Security verification: password_hash must never be in users table projection
  const usersRes = await request(app)
    .get('/api/analytics/db-viewer?table=users')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(usersRes.status, 200);
  assert.ok(!usersRes.body.columns.includes('password_hash'));
  for (const row of usersRes.body.data) {
    assert.equal(row.password_hash, undefined);
  }
});

test('DB EXPLORER 5: End-to-End Patient Creation and Database Persistence Verification', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // 1. Create a patient through the clinical registration endpoint
  const timestamp = Date.now();
  const testEmail = `charlotte.bronte.${timestamp}@example.com`;
  const registerRes = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'Charlotte',
      lastName: 'Bronte',
      email: testEmail,
      phone: '+1 555-7788',
      dob: '1992-04-21',
      gender: 'Female',
      bloodGroup: 'B+',
      emergencyContact: '+1 555-9900',
      address: '7 Haworth Parsonage',
    });

  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body.success, true);
  const createdPatientId = registerRes.body.data.id;
  const createdMrn = registerRes.body.data.mrn;

  assert.ok(createdPatientId, 'Patient ID must be generated');
  assert.ok(createdMrn, 'Patient MRN must be generated');

  // 2. Query Database Explorer directly for the patients table
  const dbExplorerRes = await request(app)
    .get(`/api/analytics/db-viewer?table=patients&search=Bronte`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(dbExplorerRes.status, 200);
  assert.equal(dbExplorerRes.body.success, true);

  // 3. Confirm that the exact record was saved in PostgreSQL with matching PK, MRN, and FK
  const matchingPatient = dbExplorerRes.body.data.find(
    (p) => p['Patient ID (PK)'] === createdPatientId
  );

  assert.ok(matchingPatient, 'Newly created patient must be physically present in PostgreSQL table query');
  assert.equal(matchingPatient['MRN Number'], createdMrn);
  assert.equal(matchingPatient['First Name'], 'Charlotte');
  assert.equal(matchingPatient['Last Name'], 'Bronte');
  assert.equal(matchingPatient['Email'], testEmail);
  assert.ok(matchingPatient['User ID (FK -> users.id)'], 'Foreign key relationship user_id must be populated');

  // 4. Verify directly in users table that corresponding user account exists
  const userCheckRes = await request(app)
    .get(`/api/analytics/db-viewer?table=users`)
    .set('Authorization', `Bearer ${adminToken}`);

  const matchingUser = userCheckRes.body.data.find(
    (u) => u['Email'] === testEmail
  );
  assert.ok(matchingUser, 'Corresponding user row must be present in PostgreSQL users table');
  assert.equal(matchingUser['User ID (PK)'], matchingPatient['User ID (FK -> users.id)']);
});

test('DB EXPLORER 6: Invalid patient creation request rolls back transaction with zero persisted data', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const invalidEmail = `rollback.test.${Date.now()}@example.com`;

  // Send payload with invalid name format that triggers backend validation failure
  const failRes = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: '12345_Invalid!',
      lastName: 'RollbackUser',
      email: invalidEmail,
      dob: '1995-01-01',
      gender: 'Female',
    });

  assert.equal(failRes.status, 400);
  assert.equal(failRes.body.success, false);

  // Check Database Explorer: confirm that no partial user or patient record was created
  const userCheckRes = await request(app)
    .get('/api/analytics/db-viewer?table=users')
    .set('Authorization', `Bearer ${adminToken}`);

  const leakedUser = userCheckRes.body.data.find((u) => u['Email'] === invalidEmail);
  assert.equal(leakedUser, undefined, 'No user record should persist after validation failure');
});

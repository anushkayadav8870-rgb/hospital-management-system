// =============================================
// server/src/tests/security.test.js
// Automated Security & Authorization Test Suite (Phase 3)
// Covers:
// 1. Patient accessing their own medical record (200)
// 2. Patient attempting to access another patient's medical record (403)
// 3. Patient accessing their own prescription (200)
// 4. Patient attempting to access another patient's prescription (403)
// 5. Doctor attempting to create a record using another doctor's identity (403)
// 6. Doctor attempting to create a prescription using another doctor's identity (403)
// 7. Administrator retaining authorized access to records/prescriptions and doctor attribution (200/201)
// =============================================

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { pool } = require('../db');

test.after(async () => {
  await pool.end();
});

// Helper to obtain token for a user
async function getAuthToken(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  assert.equal(res.status, 200, `Failed to authenticate ${email}`);
  return res.body.data.token;
}

test('SECURITY 1: Patient can access their own medical record (HTTP 200)', async () => {
  // eleanor.vance@email.com is Patient #1 (user_id: 5, patient_id: 1, record_id: 1)
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const res = await request(app)
    .get('/api/records/1')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.id, 1);
  assert.equal(res.body.data.patient.id, 1);
});

test("SECURITY 2: Patient cannot access another patient's medical record (HTTP 403)", async () => {
  // marcus.brody@email.com is Patient #2 (user_id: 6, patient_id: 2).
  // Record #1 belongs to Patient #1 (Eleanor Vance).
  const patientToken = await getAuthToken('marcus.brody@email.com', 'password123');

  const res = await request(app)
    .get('/api/records/1')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Access Forbidden/i);
});

test('SECURITY 3: Patient can access their own prescription (HTTP 200)', async () => {
  // Prescription #1 belongs to Patient #1 (Eleanor Vance).
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const res = await request(app)
    .get('/api/prescriptions/1')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.id, 1);
  assert.equal(res.body.data.patient.id, 1);
});

test("SECURITY 4: Patient cannot access another patient's prescription (HTTP 403)", async () => {
  // Prescription #1 belongs to Patient #1. Patient #2 (Marcus Brody) attempts access.
  const patientToken = await getAuthToken('marcus.brody@email.com', 'password123');

  const res = await request(app)
    .get('/api/prescriptions/1')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Access Forbidden/i);
});

test("SECURITY 5: Doctor cannot create a medical record under another doctor's identity (HTTP 403)", async () => {
  // dr.jenkins@pulsecare.com is Doctor #1 (user_id: 2, doctor_id: 1).
  // Attempts to create a record specifying doctorId: 2 (Dr. Chen).
  const doctorToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      patientId: 1,
      doctorId: 2, // Impersonating Doctor 2
      symptoms: 'Fever and chills',
      diagnosis: 'Acute viral pharyngitis',
      treatmentPlan: 'Hydration and rest',
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /another doctor's identity/i);
});

test("SECURITY 6: Doctor cannot issue a prescription under another doctor's identity (HTTP 403)", async () => {
  // dr.jenkins@pulsecare.com is Doctor #1. Attempts to create a prescription specifying doctorId: 2.
  const doctorToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/prescriptions')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      patientId: 1,
      doctorId: 2, // Impersonating Doctor 2
      instructions: 'Take one daily',
      items: [
        {
          medicineName: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
        },
      ],
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /another doctor's identity/i);
});

test('SECURITY 7: Doctor can create a record and prescription with their own identity (HTTP 201)', async () => {
  // dr.jenkins@pulsecare.com is Doctor #1 (doctor_id: 1)
  const doctorToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');

  // 1. Create record with legitimate doctorId
  const recordRes = await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      patientId: 1,
      doctorId: 1,
      symptoms: 'Mild eczema flareup',
      diagnosis: 'Atopic dermatitis',
      treatmentPlan: 'Topical hydrocortisone',
    });

  assert.equal(recordRes.status, 201);
  assert.equal(recordRes.body.success, true);
  assert.equal(recordRes.body.data.doctor_id, 1);

  // 2. Create prescription with legitimate doctorId
  const rxRes = await request(app)
    .post('/api/prescriptions')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send({
      patientId: 1,
      doctorId: 1,
      instructions: 'Apply thin layer twice daily',
      items: [
        {
          medicineName: 'Hydrocortisone 1% Cream',
          dosage: '1 Tube',
          frequency: 'Twice daily',
          duration: '14 days',
        },
      ],
    });

  assert.equal(rxRes.status, 201);
  assert.equal(rxRes.body.success, true);
  assert.equal(rxRes.body.data.doctorId, 1);
});

test('SECURITY 8: Administrator retains intended access to view any record/prescription and create for doctors (HTTP 200/201)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // 1. Admin can view Record #1 (Patient 1)
  const recordRes = await request(app)
    .get('/api/records/1')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(recordRes.status, 200);
  assert.equal(recordRes.body.success, true);

  // 2. Admin can view Prescription #1 (Patient 1)
  const rxRes = await request(app)
    .get('/api/prescriptions/1')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.equal(rxRes.status, 200);
  assert.equal(rxRes.body.success, true);

  // 3. Admin can create a record on behalf of doctorId: 1
  const createRecordRes = await request(app)
    .post('/api/records')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      doctorId: 1,
      symptoms: 'Annual checkup routine review',
      diagnosis: 'Normal cardiac rhythm',
      treatmentPlan: 'Continue current therapy',
    });
  assert.equal(createRecordRes.status, 201);
  assert.equal(createRecordRes.body.data.doctor_id, 1);
});

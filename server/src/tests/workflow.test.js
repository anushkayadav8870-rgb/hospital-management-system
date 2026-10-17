// =============================================
// server/src/tests/workflow.test.js
// Automated Integration & Workflow Test Suite
// Covers:
// 1. Valid and invalid form input validation on backend APIs
// 2. Unauthorized access to protected routes (HTTP 401)
// 3. Role-based access control permissions (HTTP 403)
// 4. Important patient and appointment workflows
// =============================================

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { pool } = require('../db');

test.after(async () => {
  await pool.end();
});

// Helper to obtain token for a role
async function getAuthToken(email, password) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data.token;
}

test('WORKFLOW 1: Protected routes reject requests without authorization token (HTTP 401)', async () => {
  const endpoints = [
    { method: 'get', url: '/api/patients' },
    { method: 'post', url: '/api/patients' },
    { method: 'get', url: '/api/doctors' },
    { method: 'post', url: '/api/doctors' },
    { method: 'get', url: '/api/appointments' },
    { method: 'post', url: '/api/appointments' },
  ];

  for (const ep of endpoints) {
    const res = await request(app)[ep.method](ep.url);
    assert.equal(res.status, 401, `Expected 401 on ${ep.method.toUpperCase()} ${ep.url}`);
    assert.equal(res.body.success, false);
  }
});

test('WORKFLOW 2: Patient creation rejects missing required fields (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: '',
      lastName: '',
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /provide required fields/i);
});

test('WORKFLOW 3: Patient creation rejects invalid name characters / symbols (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: '12345--Invalid',
      lastName: 'Smith',
      dob: '1990-01-01',
      gender: 'Male',
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /First Name must contain only alphabetic characters/i);
});

test('WORKFLOW 4: Patient creation rejects future Date of Birth (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const futureDate = '2099-01-01';
  const res = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'ValidName',
      lastName: 'Patient',
      dob: futureDate,
      gender: 'Female',
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Date of Birth must be a valid past date/i);
});

test('WORKFLOW 5: Patient creation rejects malformed email address (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'ValidName',
      lastName: 'Patient',
      email: 'not-a-valid-email',
      dob: '1995-05-15',
      gender: 'Female',
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /valid email address/i);
});

test('WORKFLOW 6: Doctor creation rejects invalid consultation fee (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/doctors')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'Gregory',
      lastName: 'House',
      email: 'dr.house.invalid@pulsecare.com',
      specialization: 'Diagnostics',
      qualification: 'MD',
      consultationFee: -50,
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Consultation fee must be a non-negative number/i);
});

test('WORKFLOW 7: Appointment booking rejects missing required fields (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      // doctorId missing
      appointmentDate: '2026-10-20',
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /provide all required fields/i);
});

test('WORKFLOW 8: Role permissions enforce authorization - Patient cannot create Doctor (HTTP 403)', async () => {
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const res = await request(app)
    .post('/api/doctors')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      firstName: 'Unauthorized',
      lastName: 'Doctor',
      email: 'unauth@pulsecare.com',
      specialization: 'General',
      qualification: 'MBBS',
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Access Forbidden: Role 'PATIENT'/i);
});

test('WORKFLOW 9: Role permissions enforce authorization - Doctor cannot deactivate Patient (HTTP 403)', async () => {
  const doctorToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');

  const res = await request(app)
    .patch('/api/patients/1/deactivate')
    .set('Authorization', `Bearer ${doctorToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Access Forbidden: Role 'DOCTOR'/i);
});

test('WORKFLOW 10: Appointment status update rejects invalid status strings (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .patch('/api/appointments/1/status')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'InvalidStatusXYZ' });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Invalid status/i);
});

test('WORKFLOW 11: Valid patient registration, retrieval, and appointment scheduling workflow', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // 1. Create a valid patient
  const uniqueEmail = `test.patient.${Date.now()}@example.com`;
  const createPatientRes = await request(app)
    .post('/api/patients')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      firstName: 'Jonathan',
      lastName: 'Harker',
      email: uniqueEmail,
      phone: '+1 555-4321',
      dob: '1988-06-20',
      gender: 'Male',
      bloodGroup: 'O+',
      emergencyContact: '+1 555-9876',
      address: '42 Baker Street',
    });

  assert.equal(createPatientRes.status, 201);
  assert.equal(createPatientRes.body.success, true);
  assert.ok(createPatientRes.body.data.id);
  assert.ok(createPatientRes.body.data.mrn);
  const newPatientId = createPatientRes.body.data.id;

  // 2. Retrieve patient list and find the registered patient
  const getPatientsRes = await request(app)
    .get('/api/patients?search=Harker')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(getPatientsRes.status, 200);
  assert.equal(getPatientsRes.body.success, true);
  const found = getPatientsRes.body.data.some((p) => p.id === newPatientId);
  assert.ok(found, 'Newly registered patient should be retrievable in patient query');

  // 3. Book a scheduled appointment for this patient with Doctor #1
  // Generate random minute/hour to ensure collision-free slot across repeat runs
  const randHour = String(Math.floor(8 + Math.random() * 9)).padStart(2, '0');
  const randMin = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  const uniqueDate = `2027-05-${String(Math.floor(1 + Math.random() * 25)).padStart(2, '0')}`;
  const bookRes = await request(app)
    .post('/api/appointments')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: newPatientId,
      doctorId: 1,
      appointmentDate: uniqueDate,
      appointmentTime: `${randHour}:${randMin}:00`,
      reason: 'General comprehensive wellness examination',
    });

  assert.equal(bookRes.status, 201);
  assert.equal(bookRes.body.success, true);
  const appointmentId = bookRes.body.data.id;

  // 4. Transition appointment status to Confirmed
  const confirmRes = await request(app)
    .patch(`/api/appointments/${appointmentId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Confirmed', notes: 'Confirmed with patient via SMS' });

  assert.equal(confirmRes.status, 200);
  assert.equal(confirmRes.body.data.status, 'Confirmed');

  // 5. Transition appointment status to Completed
  const completeRes = await request(app)
    .patch(`/api/appointments/${appointmentId}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'Completed', notes: 'Consultation finished successfully' });

  assert.equal(completeRes.status, 200);
  assert.equal(completeRes.body.data.status, 'Completed');
});

test('WORKFLOW 12: Role permissions enforce authorization - Patient/Doctor cannot deactivate Doctor (HTTP 403)', async () => {
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const res = await request(app)
    .patch('/api/doctors/1/deactivate')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Access Forbidden/i);
});

test('WORKFLOW 13: Doctor deactivation rejects non-existent doctor ID (HTTP 404)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .patch('/api/doctors/999999/deactivate')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not found/i);
});

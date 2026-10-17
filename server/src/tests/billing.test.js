// =============================================
// server/src/tests/billing.test.js
// Automated Integration & Security Tests for Billing Module
// Covers:
// 1. Unauthenticated access rejected (HTTP 401)
// 2. Admin retrieves bills with line items and payments (HTTP 200)
// 3. Patient role isolation on bills list (HTTP 200, only own bills)
// 4. Role authorization on bill creation (Doctor/Patient HTTP 403)
// 5. Validation: Non-existent patient rejected (HTTP 404)
// 6. Validation: Mismatched patient and appointment rejected (HTTP 400)
// 7. Role authorization on payment recording (Doctor/Patient HTTP 403)
// 8. Overpayment protection: payment exceeding due balance rejected (HTTP 400)
// 9. Full lifecycle: Create bill, record partial payment, verify status and balance
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
  assert.equal(res.status, 200, `Failed to authenticate ${email}`);
  return res.body.data.token;
}

test('BILLING 1: Unauthenticated request to /api/bills is rejected (HTTP 401)', async () => {
  const res = await request(app).get('/api/bills');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('BILLING 2: Admin can fetch hospital billing ledger (HTTP 200)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .get('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));

  if (res.body.data.length > 0) {
    const bill = res.body.data[0];
    assert.ok(bill.invoiceNumber.startsWith('INV-'));
    assert.equal(typeof bill.totalAmount, 'number');
    assert.equal(typeof bill.paidAmount, 'number');
    assert.equal(typeof bill.dueAmount, 'number');
    assert.ok(bill.patient && bill.patient.name);
    assert.ok(Array.isArray(bill.items));
    assert.ok(Array.isArray(bill.payments));
  }
});

test('BILLING 3: Patient sees only their own bills (HTTP 200 & role isolation)', async () => {
  // Eleanor Vance is Patient #1 (user_id: 5)
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const res = await request(app)
    .get('/api/bills')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));

  // All returned bills must belong to patient #1
  for (const bill of res.body.data) {
    assert.equal(bill.patient.id, 1, `Bill ${bill.id} does not belong to patient #1`);
  }
});

test('BILLING 4: Doctor and Patient cannot create bills (HTTP 403)', async () => {
  const doctorToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const payload = {
    patientId: 1,
    items: [{ description: 'Test Procedure', amount: 100 }],
  };

  const docRes = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send(payload);
  assert.equal(docRes.status, 403);

  const patRes = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${patientToken}`)
    .send(payload);
  assert.equal(patRes.status, 403);
});

test('BILLING 5: Bill creation rejects non-existent patient (HTTP 404)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 999999,
      items: [{ description: 'General Consultation', amount: 50.00 }],
    });

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Patient with ID 999999 not found/i);
});

test('BILLING 6: Bill creation rejects mismatched patient and appointment (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // Appointment #1 belongs to patient #1 in seed. Attempting to link with patient #2 should fail.
  const res = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 2,
      appointmentId: 1,
      items: [{ description: 'Mismatched Checkup', amount: 75.00 }],
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Appointment does not belong to the specified patient/i);
});

test('BILLING 7: Doctor and Patient cannot record payments (HTTP 403)', async () => {
  const doctorToken = await getAuthToken('dr.jenkins@pulsecare.com', 'password123');
  const patientToken = await getAuthToken('eleanor.vance@email.com', 'password123');

  const payload = {
    amountPaid: 25.00,
    paymentMethod: 'Cash',
  };

  const docRes = await request(app)
    .post('/api/bills/1/payments')
    .set('Authorization', `Bearer ${doctorToken}`)
    .send(payload);
  assert.equal(docRes.status, 403);

  const patRes = await request(app)
    .post('/api/bills/1/payments')
    .set('Authorization', `Bearer ${patientToken}`)
    .send(payload);
  assert.equal(patRes.status, 403);
});

test('BILLING 8: Overpayment protection rejects payment exceeding balance (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // Create a temporary test bill with total $100.00
  const createRes = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      items: [{ description: 'Safety Audit Item', amount: 100.00 }],
    });

  assert.equal(createRes.status, 201);
  const createdBillId = createRes.body.data.id;

  try {
    // Attempt to pay $150.00 on a $100.00 bill
    const payRes = await request(app)
      .post(`/api/bills/${createdBillId}/payments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amountPaid: 150.00,
        paymentMethod: 'Credit Card',
      });

    assert.equal(payRes.status, 400);
    assert.equal(payRes.body.success, false);
    assert.match(payRes.body.message, /cannot exceed remaining balance/i);
  } finally {
    // Cleanup test bill to maintain clean state
    await pool.query('DELETE FROM bills WHERE id = $1', [createdBillId]);
  }
});

test('BILLING 9: Bill lifecycle - creation, partial payment, and completion', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // 1. Create a bill with total $200.00
  const createRes = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      items: [
        { description: 'Consultation Fee', amount: 150.00 },
        { description: 'Lab Diagnostic', amount: 50.00 },
      ],
    });

  assert.equal(createRes.status, 201);
  const testBillId = createRes.body.data.id;
  assert.equal(createRes.body.data.totalAmount, 200.00);
  assert.equal(createRes.body.data.status, 'Pending');

  try {
    // 2. Record partial payment of $75.00
    const partialPayRes = await request(app)
      .post(`/api/bills/${testBillId}/payments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amountPaid: 75.00,
        paymentMethod: 'Cash',
        transactionRef: 'TEST-TXN-PARTIAL',
      });

    assert.equal(partialPayRes.status, 200);
    assert.equal(partialPayRes.body.data.paidAmount, 75.00);
    assert.equal(partialPayRes.body.data.dueAmount, 125.00);
    assert.equal(partialPayRes.body.data.status, 'Partially Paid');

    // 3. Complete remaining balance of $125.00
    const completePayRes = await request(app)
      .post(`/api/bills/${testBillId}/payments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amountPaid: 125.00,
        paymentMethod: 'Credit Card',
        transactionRef: 'TEST-TXN-COMPLETE',
      });

    assert.equal(completePayRes.status, 200);
    assert.equal(completePayRes.body.data.paidAmount, 200.00);
    assert.equal(completePayRes.body.data.dueAmount, 0.00);
    assert.equal(completePayRes.body.data.status, 'Paid');
  } finally {
    // Clean up temporary test bill
    await pool.query('DELETE FROM bills WHERE id = $1', [testBillId]);
  }
});

test('BILLING 10: Reject bill creation when items array is empty or missing (HTTP 400)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      items: [],
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /at least one bill line item/i);
});

test('BILLING 11: Multi-item invoice generation computes total and stores line items (HTTP 201)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  const res = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      items: [
        { description: 'Cardiology Consultation', amount: 150.00 },
        { description: 'ECG Screening', amount: 45.50 },
        { description: 'Laboratory Blood Chemistry', amount: 84.50 },
      ],
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.totalAmount, 280.00);
  const billId = res.body.data.id;

  try {
    const fetchRes = await request(app)
      .get('/api/bills')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(fetchRes.status, 200);
    const createdBill = fetchRes.body.data.find((b) => b.id === billId);
    assert.ok(createdBill);
    assert.equal(createdBill.totalAmount, 280.00);
    assert.equal(createdBill.items.length, 3);
  } finally {
    await pool.query('DELETE FROM bills WHERE id = $1', [billId]);
  }
});

test('BILLING 12: Appointment retrieval correctly filters by patientId for zero and active appointment patients (HTTP 200)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // Patient #1 has Appointment #1
  const aptPatient1Res = await request(app)
    .get('/api/appointments?patientId=1')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(aptPatient1Res.status, 200);
  assert.equal(aptPatient1Res.body.success, true);
  assert.ok(Array.isArray(aptPatient1Res.body.data));
  assert.ok(aptPatient1Res.body.data.length >= 1);
  assert.equal(aptPatient1Res.body.data[0].patient.id, 1);

  // A non-existent patient or patient with no appointments returns honest empty array
  const noAptRes = await request(app)
    .get('/api/appointments?patientId=999999')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(noAptRes.status, 200);
  assert.equal(noAptRes.body.success, true);
  assert.equal(noAptRes.body.count, 0);
  assert.deepEqual(noAptRes.body.data, []);
});

test('BILLING 13: Bill creation with linked appointment persists appointment_id (HTTP 201)', async () => {
  const adminToken = await getAuthToken('admin@pulsecare.com', 'password123');

  // Create a bill linked to Appointment #1 for Patient #1
  const res = await request(app)
    .post('/api/bills')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      patientId: 1,
      appointmentId: 1,
      items: [{ description: 'Cardiology Visit Followup', amount: 120.00 }],
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  const createdBillId = res.body.data.id;

  try {
    const dbCheck = await pool.query('SELECT appointment_id FROM bills WHERE id = $1', [createdBillId]);
    assert.equal(dbCheck.rows[0].appointment_id, 1);
  } finally {
    await pool.query('DELETE FROM bills WHERE id = $1', [createdBillId]);
  }
});


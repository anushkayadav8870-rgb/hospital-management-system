// =============================================
// server/src/tests/auth.test.js
// Automated Authentication & Authorization Test Suite
// Covers All 14 Mandatory Login & Security Test Cases
// =============================================

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { pool } = require('../db');
const { attemptsMap } = require('../middleware/rateLimiter');

// Clear rate limiter tracking before test suite execution
test.beforeEach(() => {
  attemptsMap.clear();
});

// Clean up DB pool when tests finish
test.after(async () => {
  await pool.end();
});

test('1. Reject empty login request body', async () => {
  const res = await request(app).post('/api/auth/login').send({});
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Please provide email and password/i);
});

test('2. Reject login with missing email', async () => {
  const res = await request(app).post('/api/auth/login').send({
    password: 'password123',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Please provide email and password/i);
});

test('3. Reject login with missing password', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@pulsecare.com',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Please provide email and password/i);
});

test('4. Reject malformed email formats', async () => {
  const invalidEmails = ['not-an-email', 'admin@', '@pulsecare.com', 'admin@.com'];
  for (const email of invalidEmails) {
    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });
    assert.equal(res.status, 400, `Expected 400 for email: ${email}`);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /valid email address/i);
  }
});

test('5. Reject incorrect password for an existing account', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@pulsecare.com',
    password: 'wrong_password_attempt',
  });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  // Security rule: Message must NOT reveal existence or specifics
  assert.equal(res.body.message, 'Invalid email or password.');
});

test('6. Reject unknown account with generic error message', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'nonexistent.user.random@pulsecare.com',
    password: 'somepassword123',
  });
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.equal(res.body.message, 'Invalid email or password.');
});

test('7. Authenticate valid credentials and return JWT token + user profile', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'admin@pulsecare.com',
    password: 'password123',
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.token, 'Token must be present in response');
  assert.equal(res.body.data.user.email, 'admin@pulsecare.com');
  assert.equal(res.body.data.user.role, 'ADMIN');
  assert.equal(typeof res.body.data.user.id, 'number');
  assert.equal(res.body.data.user.password_hash, undefined, 'password_hash must never be leaked');
});

test('8. Rate limit repeated failed login attempts (HTTP 429)', async () => {
  const email = 'victim@pulsecare.com';
  // Send 5 consecutive failing attempts
  for (let i = 0; i < 5; i++) {
    await request(app).post('/api/auth/login').send({
      email,
      password: 'wrongpassword',
    });
  }

  // The 6th attempt must trigger rate limiter HTTP 429
  const res = await request(app).post('/api/auth/login').send({
    email,
    password: 'wrongpassword',
  });
  assert.equal(res.status, 429);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Too many failed login attempts/i);
});

test('9. Safe client logout (token invalidation check via client-side removal)', async () => {
  // Login first
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin@pulsecare.com',
    password: 'password123',
  });
  const token = loginRes.body.data.token;

  // Verify token works
  const meRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);
  assert.equal(meRes.status, 200);

  // Once token is discarded / absent, subsequent calls are rejected
  const loggedOutRes = await request(app).get('/api/auth/me');
  assert.equal(loggedOutRes.status, 401);
  assert.equal(loggedOutRes.body.success, false);
});

test('10. Block access to protected routes without authentication header', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Missing Bearer token/i);
});

test('11. Block access to protected APIs using unauthorized role (RBAC)', async () => {
  // Login as Patient
  const patientRes = await request(app).post('/api/auth/login').send({
    email: 'eleanor.vance@email.com',
    password: 'password123',
  });
  assert.equal(patientRes.status, 200);
  const patientToken = patientRes.body.data.token;

  // Try to access analytics dashboard (allowed only for ADMIN & DOCTOR)
  const forbiddenRes = await request(app)
    .get('/api/analytics/dashboard')
    .set('Authorization', `Bearer ${patientToken}`);

  assert.equal(forbiddenRes.status, 403);
  assert.equal(forbiddenRes.body.success, false);
  assert.match(forbiddenRes.body.message, /Access Forbidden: Role 'PATIENT'/i);
});

test('12. Reject expired or malformed JWT authentication token', async () => {
  // Test malformed token
  const malformedRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', 'Bearer invalid_signature_random_data');
  assert.equal(malformedRes.status, 401);
  assert.match(malformedRes.body.message, /Invalid or expired token/i);

  // Test expired token
  const expiredToken = jwt.sign(
    { id: 1, role: 'ADMIN' },
    process.env.JWT_SECRET || 'pulsecare_super_secret_jwt_key_change_in_production',
    { expiresIn: '-1s' }
  );
  const expiredRes = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${expiredToken}`);
  assert.equal(expiredRes.status, 401);
  assert.match(expiredRes.body.message, /Invalid or expired token/i);
});

test('13. Enforce field length constraints on direct API payload bypass attempts', async () => {
  const excessiveEmail = 'a'.repeat(250) + '@example.com';
  const res = await request(app).post('/api/auth/login').send({
    email: excessiveEmail,
    password: 'password123',
  });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Input exceeds maximum allowed length/i);
});

test('14. SQL Injection payload rejection on login authentication', async () => {
  const sqliPayloads = [
    "' OR '1'='1",
    "admin@pulsecare.com'--",
    "admin@pulsecare.com' /*",
  ];

  for (const sqli of sqliPayloads) {
    const res = await request(app).post('/api/auth/login').send({
      email: sqli,
      password: 'password123',
    });
    // Parameterized queries & validators guarantee safe rejection without DB error
    assert.ok(res.status === 400 || res.status === 401);
    assert.equal(res.body.success, false);
  }
});

test('15. Authenticate valid user when email has accidental leading or trailing whitespace', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: '   admin@pulsecare.com   ',
    password: 'password123',
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.token);
  assert.equal(res.body.data.user.email, 'admin@pulsecare.com');
});

test('16. Reject empty or whitespace-only password and email', async () => {
  const res1 = await request(app).post('/api/auth/login').send({
    email: '   ',
    password: 'password123',
  });
  assert.equal(res1.status, 400);
  assert.equal(res1.body.success, false);

  const res2 = await request(app).post('/api/auth/login').send({
    email: 'admin@pulsecare.com',
    password: '',
  });
  assert.equal(res2.status, 400);
  assert.equal(res2.body.success, false);
});

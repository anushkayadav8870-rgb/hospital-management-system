// =============================================
// server/src/db/seed_modules.js
// Safe Demonstration Seed Data for Beds, Medicines, and Staff Accounts
// =============================================

const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
const { pool } = require('./index');

async function seedModules() {
  console.log('--- Seeding Demonstration Accounts & Module Records ---');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Password hash for test accounts
    const passwordHash = await bcrypt.hash('password123', 10);

    // 2. Demonstration Staff Users for New Roles
    const usersToSeed = [
      {
        email: 'patient.manager@pulsecare.com',
        role: 'PATIENT_MANAGER',
        firstName: 'Sarah',
        lastName: 'Conner',
        phone: '+1-555-0191',
      },
      {
        email: 'pharmacy@pulsecare.com',
        role: 'PHARMACY_MANAGER',
        firstName: 'Marcus',
        lastName: 'Vance',
        phone: '+1-555-0192',
      },
      {
        email: 'billing@pulsecare.com',
        role: 'BILLING_STAFF',
        firstName: 'David',
        lastName: 'Kim',
        phone: '+1-555-0193',
      },
    ];

    for (const u of usersToSeed) {
      await client.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [u.email, passwordHash, u.role, u.firstName, u.lastName, u.phone]
      );
    }

    // 3. Beds Seed Data
    const bedsToSeed = [
      { bed_number: 'B-101', ward_type: 'General', room_number: '101', daily_rate: 80.00, status: 'Available' },
      { bed_number: 'B-102', ward_type: 'General', room_number: '101', daily_rate: 80.00, status: 'Available' },
      { bed_number: 'ICU-01', ward_type: 'ICU', room_number: 'ICU-A', daily_rate: 350.00, status: 'Available' },
      { bed_number: 'ICU-02', ward_type: 'ICU', room_number: 'ICU-A', daily_rate: 350.00, status: 'Available' },
      { bed_number: 'MAT-201', ward_type: 'Maternity', room_number: '201', daily_rate: 150.00, status: 'Available' },
      { bed_number: 'PED-301', ward_type: 'Pediatric', room_number: '301', daily_rate: 120.00, status: 'Available' },
    ];

    for (const b of bedsToSeed) {
      await client.query(
        `INSERT INTO beds (bed_number, ward_type, room_number, daily_rate, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (bed_number) DO NOTHING`,
        [b.bed_number, b.ward_type, b.room_number, b.daily_rate, b.status]
      );
    }

    // 4. Medicines Seed Data
    const medicinesToSeed = [
      { name: 'Amoxicillin 500mg', generic_name: 'Amoxicillin', category: 'Antibiotic', unit_price: 12.50, stock_quantity: 150, reorder_level: 25, unit_measure: 'Capsules' },
      { name: 'Paracetamol 500mg', generic_name: 'Acetaminophen', category: 'Analgesic', unit_price: 4.00, stock_quantity: 300, reorder_level: 50, unit_measure: 'Tablets' },
      { name: 'Ibuprofen 400mg', generic_name: 'Ibuprofen', category: 'Analgesic / Anti-inflammatory', unit_price: 6.50, stock_quantity: 80, reorder_level: 20, unit_measure: 'Tablets' },
      { name: 'Metformin 850mg', generic_name: 'Metformin HCl', category: 'Antidiabetic', unit_price: 15.00, stock_quantity: 95, reorder_level: 15, unit_measure: 'Tablets' },
      { name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate', category: 'Antihypertensive', unit_price: 18.00, stock_quantity: 120, reorder_level: 20, unit_measure: 'Tablets' },
      { name: 'Cough Syrup 100ml', generic_name: 'Dextromethorphan', category: 'Respiratory', unit_price: 9.75, stock_quantity: 45, reorder_level: 10, unit_measure: 'Syrup (ml)' },
    ];

    for (const m of medicinesToSeed) {
      const existing = await client.query('SELECT id FROM medicines WHERE name = $1', [m.name]);
      if (existing.rows.length === 0) {
        await client.query(
          `INSERT INTO medicines (name, generic_name, category, unit_price, stock_quantity, reorder_level, unit_measure)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [m.name, m.generic_name, m.category, m.unit_price, m.stock_quantity, m.reorder_level, m.unit_measure]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Demonstration accounts, beds, and medicines successfully seeded!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedModules();

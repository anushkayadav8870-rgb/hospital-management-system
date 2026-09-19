-- =============================================
-- server/src/db/schema.sql
-- PulseCare Hospital Management System DDL Schema
-- =============================================

-- Clean up existing tables and types if re-running script (Development mode safety)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- -----------------------------------------------
-- 1. Custom ENUM Types
-- -----------------------------------------------
CREATE TYPE user_role AS ENUM ('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT');
CREATE TYPE appointment_status AS ENUM ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show');
CREATE TYPE payment_status AS ENUM ('Pending', 'Partially Paid', 'Paid');

-- -----------------------------------------------
-- 2. Central Users Table (Authentication & RBAC)
-- -----------------------------------------------
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 3. Departments Table
-- -----------------------------------------------
CREATE TABLE departments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    location_floor VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 4. Doctors Profile Table
-- -----------------------------------------------
CREATE TABLE doctors (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    specialization VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 5. Patients Profile Table
-- -----------------------------------------------
CREATE TABLE patients (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    mrn VARCHAR(50) UNIQUE NOT NULL, -- Medical Record Number (e.g. PAT-2026-001)
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    emergency_contact VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 6. Doctor Schedules Table
-- -----------------------------------------------
CREATE TABLE doctor_schedules (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL, -- 'Monday', 'Tuesday', etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_patients INT DEFAULT 15,
    UNIQUE(doctor_id, day_of_week)
);

-- -----------------------------------------------
-- 7. Appointments Table
-- -----------------------------------------------
CREATE TABLE appointments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'Scheduled',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_doctor_time UNIQUE(doctor_id, appointment_date, appointment_time)
);

-- -----------------------------------------------
-- 8. Medical Records (EMR) Table
-- -----------------------------------------------
CREATE TABLE medical_records (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    appointment_id INT UNIQUE REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    doctor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 9. Prescriptions Table
-- -----------------------------------------------
CREATE TABLE prescriptions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    medical_record_id INT REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 10. Prescription Items Table (M:N linking table)
-- -----------------------------------------------
CREATE TABLE prescription_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL, -- e.g. '500mg'
    frequency VARCHAR(50) NOT NULL, -- e.g. 'Twice daily after meals'
    duration VARCHAR(50) NOT NULL -- e.g. '7 days'
);

-- -----------------------------------------------
-- 11. Bills Table
-- -----------------------------------------------
CREATE TABLE bills (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status payment_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 12. Bill Items Breakdown Table
-- -----------------------------------------------
CREATE TABLE bill_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL
);

-- -----------------------------------------------
-- 13. Payments Ledger Table
-- -----------------------------------------------
CREATE TABLE payments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'Credit Card', 'Cash', 'Insurance'
    transaction_ref VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 14. In-App Notifications Table
-- -----------------------------------------------
CREATE TABLE notifications (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Performance Indexing
-- -----------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_appointments_date ON appointments(appointment_date, doctor_id);
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);

-- =============================================
-- server/src/db/migrations/001_expand_schema.sql
-- Non-destructive migration for CareSync HMS
-- =============================================

-- 1. Safely add new roles to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PATIENT_MANAGER';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PHARMACY_MANAGER';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'BILLING_STAFF';

-- 2. Beds Table
CREATE TABLE IF NOT EXISTS beds (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bed_number VARCHAR(50) UNIQUE NOT NULL,
    ward_type VARCHAR(50) NOT NULL, -- 'General', 'ICU', 'Maternity', 'Pediatric', 'Emergency'
    room_number VARCHAR(50) NOT NULL,
    daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Available', -- 'Available', 'Occupied', 'Maintenance'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bed_status CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    CONSTRAINT chk_bed_daily_rate CHECK (daily_rate >= 0)
);

-- 3. Admissions Table
CREATE TABLE IF NOT EXISTS admissions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    bed_id INT NOT NULL REFERENCES beds(id) ON DELETE RESTRICT,
    admitting_doctor_id INT REFERENCES doctors(id) ON DELETE SET NULL,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP WITH TIME ZONE,
    diagnosis TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Admitted', -- 'Admitted', 'Discharged'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_admission_status CHECK (status IN ('Admitted', 'Discharged'))
);

-- 4. Medicines Table (Pharmacy Inventory)
CREATE TABLE IF NOT EXISTS medicines (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    generic_name VARCHAR(150),
    category VARCHAR(100) NOT NULL, -- 'Antibiotic', 'Analgesic', 'Antihypertensive', etc.
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    unit_measure VARCHAR(50) NOT NULL DEFAULT 'Tablets', -- 'Tablets', 'Capsules', 'Syrup (ml)', 'Injection'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_medicine_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_medicine_stock CHECK (stock_quantity >= 0),
    CONSTRAINT chk_medicine_reorder CHECK (reorder_level >= 0)
);

-- 5. Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    medicine_id INT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'Purchase', 'Dispensed', 'Adjustment', 'Return'
    quantity_change INT NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    prescription_id INT REFERENCES prescriptions(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_inv_tx_type CHECK (transaction_type IN ('Purchase', 'Dispensed', 'Adjustment', 'Return'))
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g. 'LOGIN_SUCCESS', 'PATIENT_CREATE', 'BILL_PAID'
    resource_type VARCHAR(50) NOT NULL, -- e.g. 'AUTH', 'PATIENT', 'BILL', 'BED', 'MEDICINE'
    resource_id VARCHAR(50),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Performance & Integrity Indexes
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_bed ON admissions(bed_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);
CREATE INDEX IF NOT EXISTS idx_inv_tx_medicine ON inventory_transactions(medicine_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

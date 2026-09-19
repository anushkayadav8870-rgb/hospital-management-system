-- =============================================
-- server/src/db/seed.sql
-- Fictional Seed Data for PulseCare HMS Prototype
-- =============================================

-- 1. Departments
INSERT INTO departments (name, description, location_floor) VALUES
('Cardiology', 'Heart, vascular system, and cardiovascular disorders.', 'Floor 3 - Wing A'),
('Pediatrics', 'Comprehensive healthcare for infants, children, and adolescents.', 'Floor 2 - Wing B'),
('Neurology', 'Brain, spinal cord, and nerve health disorders.', 'Floor 4 - Wing C'),
('Orthopedics', 'Musculoskeletal system, bones, joints, and ligaments.', 'Floor 1 - Wing A');

-- 2. Users (Passwords hashed using bcrypt for "password123": $2a$10$w8u7eR/4L/O1uA8O6y8b9O3U.Z0K...)
INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES
('admin@pulsecare.com', '$2a$10$7rV.zM1R.N0E9v.v/v1u.O0/8.u8v1u.O0/8.u8v1u.O0/8', 'ADMIN', 'Arthur', 'Pendelton', '+1 555-0100'),
('dr.jenkins@pulsecare.com', '$2a$10$7rV.zM1R.N0E9v.v/v1u.O0/8.u8v1u.O0/8.u8v1u.O0/8', 'DOCTOR', 'Sarah', 'Jenkins', '+1 555-0101'),
('dr.chen@pulsecare.com', '$2a$10$7rV.zM1R.N0E9v.v/v1u.O0/8.u8v1u.O0/8.u8v1u.O0/8', 'DOCTOR', 'Robert', 'Chen', '+1 555-0102'),
('reception@pulsecare.com', '$2a$10$7rV.zM1R.N0E9v.v/v1u.O0/8.u8v1u.O0/8.u8v1u.O0/8', 'RECEPTIONIST', 'Clara', 'Oswald', '+1 555-0103'),
('eleanor.vance@email.com', '$2a$10$7rV.zM1R.N0E9v.v/v1u.O0/8.u8v1u.O0/8.u8v1u.O0/8', 'PATIENT', 'Eleanor', 'Vance', '+1 555-0192'),
('marcus.brody@email.com', '$2a$10$7rV.zM1R.N0E9v.v/v1u.O0/8.u8v1u.O0/8.u8v1u.O0/8', 'PATIENT', 'Marcus', 'Brody', '+1 555-0144');

-- 3. Doctors
INSERT INTO doctors (user_id, department_id, specialization, qualification, consultation_fee, bio) VALUES
(2, 1, 'Cardiovascular Disease', 'MD, FACC', 120.00, 'Senior Cardiologist specializing in preventive heart health.'),
(3, 2, 'Pediatric Emergency Medicine', 'MD, FAAP', 90.00, 'Dedicated pediatrician with 12+ years clinical practice.');

-- 4. Patients
INSERT INTO patients (user_id, mrn, date_of_birth, gender, blood_group, emergency_contact, address) VALUES
(5, 'PAT-2026-001', '1992-04-14', 'Female', 'A+', 'Thomas Vance (+1 555-0999)', '742 Evergreen Terrace, Springfield'),
(6, 'PAT-2026-002', '1974-11-08', 'Male', 'O+', 'Marion Brody (+1 555-0888)', '123 University Ave, Boston');

-- 5. Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason) VALUES
(1, 1, CURRENT_DATE, '09:30:00', 'Completed', 'Routine annual cardiac checkup'),
(2, 2, CURRENT_DATE, '10:15:00', 'Confirmed', 'Childhood allergy review');

-- 6. Medical Record
INSERT INTO medical_records (appointment_id, patient_id, doctor_id, symptoms, diagnosis, treatment_plan, doctor_notes) VALUES
(1, 1, 1, 'Occasional mild chest tightness during vigorous exercise.', 'Mild stress-induced hypertension.', 'Lifestyle modification, reduced sodium intake, low-dose beta blocker.', 'ECG results within normal limits. Patient advised to keep exercise log.');

-- 7. Prescription
INSERT INTO prescriptions (medical_record_id, patient_id, doctor_id, instructions) VALUES
(1, 1, 1, 'Take medications with water every morning after breakfast.');

INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration) VALUES
(1, 'Atenolol', '25mg', 'Once daily (Morning)', '30 days'),
(1, 'Multivitamin Complex', '1 Tablet', 'Once daily', '60 days');

-- 8. Bills
INSERT INTO bills (patient_id, appointment_id, total_amount, paid_amount, status) VALUES
(1, 1, 145.00, 145.00, 'Paid');

INSERT INTO bill_items (bill_id, description, amount) VALUES
(1, 'Cardiology Consultation Fee', 120.00),
(1, 'ECG Screening Procedure', 25.00);

INSERT INTO payments (bill_id, amount_paid, payment_method, transaction_ref) VALUES
(1, 145.00, 'Credit Card', 'TXN-994821');

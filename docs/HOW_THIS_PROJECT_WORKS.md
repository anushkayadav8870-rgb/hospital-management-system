# HOW THIS PROJECT WORKS
## PulseCare Hospital Management System (HMS) — Architectural Guide

Welcome! This guide explains how the PulseCare Hospital Management System works from end to end in simple, beginner-friendly language.

---

## 1. High-Level Architecture

The project consists of 3 primary web application layers + 1 C language companion module:

```
[ FRONTEND ] ──► [ BACKEND REST API ] ──► [ DATABASE ]
React + Vite       Node.js + Express      PostgreSQL
 (Port 5173)          (Port 5000)          (Port 5432)
                                                ▲
                                                │ Conceptual Link
                                     [ C ALGORITHMS MODULE ]
                                      Structs, Pointers, Search/Sort
```

---

## 2. What Happens When a User Clicks "Book Appointment"?

Let's trace a request step by step:

1. **User Action (React Frontend)**:
   - The user fills out the booking form in `BookingModal.jsx` and clicks **Confirm Booking**.
2. **HTTP Fetch Request (`client/src/services/appointmentService.js`)**:
   - The browser sends an HTTP `POST` request to `http://localhost:5000/api/appointments` with JSON body:
     ```json
     {
       "patientId": 1,
       "doctorId": 2,
       "appointmentDate": "2026-09-22",
       "appointmentTime": "10:15"
     }
     ```
   - It automatically attaches `Authorization: Bearer <jwt_token>` in the request header.
3. **Authentication & Authorization (`server/src/middleware/authMiddleware.js`)**:
   - Express receives the request.
   - `protect` middleware verifies the cryptographic signature of the JWT token.
   - `authorize('ADMIN', 'RECEPTIONIST', 'PATIENT')` verifies that the user's role has permission to book visits.
4. **Business Logic & Conflict Prevention (`server/src/controllers/appointmentController.js`)**:
   - The controller runs a **pre-flight conflict check query** against PostgreSQL to verify that the doctor does not already have an active visit at that exact date and time slot.
5. **Database Query Execution (`server/src/db/index.js`)**:
   - The controller borrows a database connection from the `pg` Pool and executes a parameterized SQL query:
     ```sql
     INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status)
     VALUES ($1, $2, $3, $4, 'Scheduled')
     RETURNING *;
     ```
6. **HTTP Response & State Update**:
   - Express returns HTTP status code `201 Created` with the new appointment JSON object.
   - React receives the response, closes the modal, appends the appointment to state, and updates the table without a page refresh!

---

## 3. How Authentication Works (bcrypt + JWT)

1. **Password Encryption (`bcryptjs`)**:
   - Passwords are **never** stored in plain text.
   - When a user registers, bcrypt adds a random salt and generates a one-way hash:
     `password123` $\rightarrow$ `$2a$10$7rV.zM1R.N0E9v.v/v1u...`
2. **Stateless Tokens (JWT)**:
   - Upon successful login, Express signs a JWT containing the user's `id` and `role`.
   - The React client saves this token in `localStorage` and attaches it to future requests.

---

## 4. Role of the C Language Module

C is **not** used to serve web pages or handle HTTP traffic. 

Instead, C serves as a low-level Computer Science companion located in `/c-algorithms`:
- **`01_patient_records.c`**: Teaches memory allocation, custom `structs`, pointers (`->`), and reading/writing binary files (`fwrite`/`fread`).
- **`02_patient_search_sort.c`**: Teaches Linear Search ($O(n)$) vs. Binary Search ($O(\log n)$) and Quicksort sorting algorithms to prioritize emergency room triage queues.

---

## 5. Summary of Completed Phases

- **Phase 0**: Project Planning & 3-Tier Architecture Blueprint.
- **Phase 1**: Environment setup (Git, Node.js, Express, React+Vite, `.gitignore`).
- **Phase 2**: Frontend Foundation (CSS Design System, React Components, Layout, Auth Context).
- **Phase 3**: Database Foundation (Relational DDL Schema, Seed Data, `pg` Pool).
- **Phase 4**: Backend Foundation (REST API conventions, Controllers, Routes, Error Middleware).
- **Phase 5**: Authentication (bcrypt password hashing, JWT tokens, RBAC middleware).
- **Phase 6**: Patient Management (MRN generator, search filter, patient modal).
- **Phase 7**: Doctor & Department Management (Relational SQL JOINs, department counts, doctor modal).
- **Phase 8**: Appointments & Scheduling (Conflict prevention engine, booking modal, status state machine).
- **Phase 9**: Medical Records / EMR (Clinical diagnoses, privacy authorization rules).
- **Phase 10**: Prescriptions (Master-Detail orders, atomic SQL transactions, dynamic medicine form).
- **Phase 11**: Billing (Financial ledgers, line item breakdowns, payment status recalculation).
- **Phase 12**: Analytics (Role-based metrics API for Admin, Doctor, and Patient dashboards).
- **Phase 13**: C Programming Companion Suite (Struct memory layout, binary file I/O, triage sorting algorithms).
- **Phase 14**: Verification & Testing (Build checks, route diagnostics, clean compilation).
- **Phase 15**: Documentation & Architectural Master Guide.

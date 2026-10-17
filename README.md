# PulseCare Hospital Management System (HMS)

[![Live Application](https://img.shields.io/badge/Live%20Demo-pulsecare--hms.vercel.app-000000?style=flat&logo=vercel)](https://pulsecare-hms.vercel.app)
[![API Health](https://img.shields.io/badge/API%20Health-pulsecare--hms--api.onrender.com-46E3B7?style=flat&logo=render)](https://pulsecare-hms-api.onrender.com/api/health)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v4.18-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14%2B-blue.svg)](https://www.postgresql.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Tests: 56 Passed](https://img.shields.io/badge/Tests-56%20Passed-brightgreen.svg)]()

> A production-grade, full-stack Hospital Management System (HMS) architected with React 19, Node.js, Express, and PostgreSQL. Features role-based access control (RBAC), appointment conflict prevention, electronic medical records (EMR), master-detail prescriptions with atomic database transactions, billing ledgers, and a companion C language algorithms suite.

- 🌐 **Live Web Application**: [https://pulsecare-hms.vercel.app](https://pulsecare-hms.vercel.app)
- ⚡ **Production REST API**: [https://pulsecare-hms-api.onrender.com](https://pulsecare-hms-api.onrender.com)
- 🩺 **System Health Endpoint**: [https://pulsecare-hms-api.onrender.com/api/health](https://pulsecare-hms-api.onrender.com/api/health)
- 📦 **GitHub Repository**: [https://github.com/anushkayadav8870-rgb/hospital-management-system](https://github.com/anushkayadav8870-rgb/hospital-management-system)

---

## 📋 Table of Contents

1. [Project Overview & Objectives](#-project-overview--objectives)
2. [User Roles & Permissions](#-user-roles--permissions)
3. [Key Modules & Features](#-key-modules--features)
4. [Technology Stack](#-technology-stack)
5. [System Architecture & Data Flow](#-system-architecture--data-flow)
6. [Repository & Project Structure](#-repository--project-structure)
7. [Local Development Setup](#-local-development-setup)
8. [Environment Variable Configuration](#-environment-variable-configuration)
9. [Database Setup & Schema](#-database-setup--schema)
10. [REST API Documentation](#-rest-api-documentation)
11. [Testing & Quality Assurance](#-testing--quality-assurance)
12. [Cloud Deployment Guide](#-cloud-deployment-guide)
13. [Security Architecture & Audit](#-security-architecture--audit)
14. [Screenshots & UI Showcase](#-screenshots--ui-showcase)
15. [Known Limitations & Future Improvements](#-known-limitations--future-improvements)
16. [Author & Contributions](#-author--contributions)

---

## 🏥 Project Overview & Objectives

Healthcare facilities require reliable, secure, and intuitive platforms to coordinate patient admissions, consultations, diagnostic history, pharmacy orders, and revenue collection. 

**PulseCare HMS** is engineered to replace fragmented manual registers with a centralized, ACID-compliant relational platform that:
- Eliminates doctor double-booking via pre-flight conflict prevention queries.
- Protects patient privacy using granular role-based access control (RBAC) and role-isolated data filtering.
- Guarantees financial data integrity through atomic PostgreSQL transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) for multi-item invoices and prescriptions.
- Provides real-time clinical and operational analytics for hospital administrators, clinicians, and patients.
- Bridges modern web engineering with systems programming via an educational C companion algorithms suite (`/c-algorithms`) demonstrating memory layout, binary record serialization, and emergency triage priority queues.

---

## 👥 User Roles & Permissions

PulseCare HMS enforces role-based authorization via custom Express middleware (`protect` and `authorize`):

| Role | Dashboard | Patients | Doctors & Depts | Appointments | Medical Records | Prescriptions | Billing & Payments |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`ADMIN`** | Hospital-wide KPIs | Full CRUD | Full CRUD | Schedule & View All | View All | View All | Issue Invoices & Payments |
| **`DOCTOR`** | Doctor Consultation Stats | View & Search | View Directory | Manage Status (`Confirmed`/`Completed`) | Create & View Clinical Records | Prescribe Medicines | Read-Only Ledger |
| **`RECEPTIONIST`** | Patient Flow KPIs | Register & Update | View Staff & Schedules | Book & Reschedule | Restricted | Restricted | Issue Invoices & Record Payments |
| **`PATIENT`** | Personal Health Summary | Own Profile | View Doctors & Depts | Book Own Visits | View Own EMR History | View Own Prescriptions | View Own Invoices & Balances |

### Default Demo Credentials

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@pulsecare.com` | `password123` |
| **Attending Doctor** | `dr.jenkins@pulsecare.com` | `password123` |
| **Frontdesk Receptionist** | `reception@pulsecare.com` | `password123` |
| **Registered Patient** | `eleanor.vance@email.com` | `password123` |

---

## ⚡ Key Modules & Features

### 1. Dashboard & Operational Analytics
- Dynamic KPIs computed per role: Total Patients, Active Doctors, Scheduled Appointments, and Financial Revenue.
- Revenue breakdown and appointment status distribution.
- Upcoming patient visits timeline and quick-action shortcuts.

### 2. Patient Administration
- Automated Medical Record Number (MRN) generator format: `PAT-YYYY-XXXX`.
- Comprehensive patient intake: full demographic details, blood group, emergency contact, date of birth validation.
- Server-side search filter across patient names, MRN numbers, and phone records.
- Soft-deactivation workflow (`isActive = false`) to preserve medical history audit trails.

### 3. Doctor Directory & Department Management
- Department hierarchy linking doctors with specialties and physical hospital floor locations.
- Consultation fee management and qualifications directory.
- Doctor scheduling module defining weekly availability and patient intake thresholds.

### 4. Appointment Scheduling & Conflict Engine
- **Pre-Flight Conflict Prevention**: Backend rejects conflicting booking requests for the same doctor at the same date/time with clear feedback.
- State machine lifecycle: `Scheduled` $\rightarrow$ `Confirmed` $\rightarrow$ `Completed` (or `Cancelled` / `No-Show`).
- Searchable patient and clinician selectors with date/time pickers.

### 5. Electronic Medical Records (EMR)
- Structured clinical examination documentation: symptoms, primary diagnosis, treatment plan, and physician notes.
- Linked directly to specific consultations or logged as general health encounters.
- Strict data privacy isolation: patients can only access their own clinical encounters.

### 6. Master-Detail Prescriptions
- Multi-row medication prescription builder with medicine name, dosage, frequency, and duration.
- **Database Atomicity**: Header prescription records and child line-item medications are committed inside a single PostgreSQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`).
- Doctor credentials and patient identifiers verified before persistence.

### 7. Billing & Payment Ledger
- Multi-item hospital invoice generation with dynamic subtotal calculations.
- Associated appointment linking with automatic single-appointment preselection and race-condition prevention.
- Payment processing ledger supporting partial payments, cash/card/insurance methods, and strict **overpayment prevention** (payments exceeding outstanding balances are rejected).
- Real-time invoice balance tracking (`Pending` $\rightarrow$ `Partially Paid` $\rightarrow$ `Paid`).

### 8. Systems Programming Companion Suite (`/c-algorithms`)
- Independent C companion modules demonstrating how low-level systems handle hospital data structures:
  - `01_patient_records.c`: Binary file I/O (`fwrite`/`fread`), custom C structs, and memory layout.
  - `02_patient_search_sort.c`: $O(n)$ Linear Search vs. $O(\log n)$ Binary Search and Quicksort triage sorting for emergency room intake.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Styling**: Custom CSS Design System with dark-mode aesthetic, design tokens, and modular layouts
- **Linter**: [Oxlint](https://oxc-project.github.io/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+ LTS, tested on v22)
- **Web Framework**: [Express.js](https://expressjs.com/) (v4.18)
- **Database Driver**: [`pg`](https://node-postgres.com/) (v8.11 with connection pooling)
- **Security & Tokens**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (salted password hashing), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (stateless JWT authentication)
- **CORS Handling**: `cors` middleware with configurable client origin
- **Process Management**: `nodemon` for active local development

### Database
- **Engine**: [PostgreSQL 14+](https://www.postgresql.org/) (Compatible with Neon Cloud PostgreSQL, AWS RDS, Render Postgres)
- **Architecture**: 14 normalized relational tables, foreign key constraints with cascading rules, custom ENUM types, and B-Tree indexes.

### Automated Testing
- **Test Runner**: Node.js Native Test Runner (`node:test`, `node:assert/strict`)
- **HTTP Integration Testing**: [Supertest](https://github.com/ladjs/supertest) (v7)

---

## 📐 System Architecture & Data Flow

PulseCare HMS implements a 3-tier decoupled architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│     React 19 SPA (Vite) + Context API + React Router v7      │
│     Hosted on Vercel / Localhost (Port 5173)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer                           │
│     Node.js + Express REST API Server                       │
│     Hosted on Render / Localhost (Port 5000)                │
│                                                             │
│   ├── Auth Middleware (JWT Verification)                    │
│   ├── Role Middleware (RBAC Permissions)                    │
│   ├── Route Controllers (Business Logic & Transactions)     │
│   └── Central Error Handler (RFC-compliant JSON errors)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ pg Connection Pool
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database Layer                          │
│     PostgreSQL Relational DB (ACID Compliant)               │
│     Hosted on Neon / Localhost (Port 5432)                  │
│                                                             │
│   ├── Users, Roles, Doctors, Schedules, Patients            │
│   ├── Appointments (Conflict Constraint Index)              │
│   ├── Medical Records & Prescriptions (Foreign Keys)        │
│   └── Bills, Bill Items & Payments (Financial Integrity)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Repository & Project Structure

```
hospital-management-system/
├── .gitignore                      # Git exclusion rules (env, build artifacts, node_modules)
├── README.md                       # Comprehensive project documentation
├── render.yaml                     # Render Infrastructure-as-Code blueprint for backend
├── vercel.json                     # Vercel SPA client rewrite configuration
│
├── c-algorithms/                   # C Language Systems Programming Module
│   ├── 01_patient_records.c        # Struct memory layout & binary I/O (fread/fwrite)
│   ├── 02_patient_search_sort.c    # Quicksort, Linear Search, Binary Search triage
│   └── patients.dat                # Sample serialized binary data file
│
├── client/                         # React 19 Frontend Application
│   ├── .env.example                # Template for frontend environment variables
│   ├── index.html                  # HTML5 entrypoint
│   ├── package.json                # Frontend dependencies and build scripts
│   ├── vite.config.js              # Vite bundler configuration
│   └── src/
│       ├── App.css / index.css     # Design tokens, variables, base styles
│       ├── App.jsx / main.jsx      # Root routing provider and mounting logic
│       ├── assets/                 # Icons and graphics
│       ├── components/             # Reusable UI components by feature
│       │   ├── appointments/       # BookingModal.jsx
│       │   ├── billing/            # CreateBillModal.jsx, PaymentModal.jsx
│       │   ├── common/             # Button.jsx, Badge.jsx, StatCard.jsx
│       │   ├── doctors/            # DoctorModal.jsx, DoctorScheduleModal.jsx
│       │   ├── emr/                # RecordModal.jsx
│       │   ├── layout/             # Layout.jsx, Navbar.jsx, Sidebar.jsx, ProtectedRoute.jsx
│       │   ├── patients/           # PatientModal.jsx
│       │   └── prescriptions/      # PrescriptionModal.jsx
│       ├── context/                # AuthContext.jsx (Authentication state)
│       ├── pages/                  # Page-level route views
│       │   ├── admin/              # DatabaseViewer.jsx
│       │   ├── appointments/       # Appointments.jsx
│       │   ├── auth/               # Login.jsx
│       │   ├── billing/            # Billing.jsx
│       │   ├── dashboard/          # Dashboard.jsx
│       │   ├── doctors/            # Doctors.jsx
│       │   ├── emr/                # MedicalRecords.jsx
│       │   ├── patients/           # Patients.jsx
│       │   └── prescriptions/      # Prescriptions.jsx
│       ├── services/               # API clients (api.js, auth, appointment, billing, etc.)
│       └── utils/                  # Formatting and validation helpers
│
├── docs/                           # Architectural Documentation
│   └── HOW_THIS_PROJECT_WORKS.md   # Architectural breakdown of core workflows
│
└── server/                         # Express REST API Server
    ├── .env.example                # Template for backend environment variables
    ├── package.json                # Backend dependencies and test scripts
    └── src/
        ├── app.js                  # Express application setup & middleware assembly
        ├── server.js               # HTTP listener and port binding
        ├── controllers/            # Controller business logic
        │   ├── analyticsController.js
        │   ├── appointmentController.js
        │   ├── authController.js
        │   ├── billingController.js
        │   ├── departmentController.js
        │   ├── doctorController.js
        │   ├── healthController.js
        │   ├── patientController.js
        │   ├── prescriptionController.js
        │   └── recordController.js
        ├── db/                     # Database management
        │   ├── index.js            # pg Connection Pool initialization
        │   ├── migrate.js          # Migration runner utility
        │   ├── schema.sql          # Primary DDL relational schema (14 tables)
        │   ├── seed.sql            # Seed dataset (users, doctors, patients, appointments)
        │   ├── seed_modules.js     # Extended seed runner
        │   └── migrations/         # Incremental SQL migration files
        ├── middleware/             # Express middlewares
        │   ├── asyncHandler.js     # Promise error forwarding wrapper
        │   ├── authMiddleware.js   # JWT signature verification
        │   ├── errorMiddleware.js  # 404 & global exception handlers
        │   ├── rateLimiter.js      # Endpoint request throttler
        │   └── roleMiddleware.js   # RBAC authorization enforcement
        ├── routes/                 # Express REST endpoint routers
        ├── tests/                  # Automated integration test suites (56 tests)
        │   ├── auth.test.js
        │   ├── billing.test.js
        │   ├── db_explorer.test.js
        │   ├── security.test.js
        │   └── workflow.test.js
        └── utils/                  # Token generation and regex field validators
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Node.js 20 or 22 recommended)
- **npm**: v9 or later
- **PostgreSQL**: v14 or later (or free cloud instance on [Neon](https://neon.tech))
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/anushkayadav8870-rgb/hospital-management-system.git
cd hospital-management-system
```

### 3. Database Initialization (PostgreSQL)
Ensure your PostgreSQL instance is running, then create the database and user:
```bash
# Using PostgreSQL CLI (psql)
psql -U postgres -c "CREATE DATABASE hms_db;"
psql -U postgres -c "CREATE USER hms_user WITH PASSWORD 'hms_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;"

# Apply DDL schema and initial seed data
psql -U hms_user -d hms_db -f server/src/db/schema.sql
psql -U hms_user -d hms_db -f server/src/db/seed.sql
```

### 4. Backend Setup & Startup
```bash
cd server
cp .env.example .env
npm install

# Run database schema migrations
node src/db/migrate.js

# Start backend in development mode (hot reloading via nodemon)
npm run dev
```
Backend server will start on: **`http://localhost:5000`**  
Verify health check at: **`http://localhost:5000/api/health`**

### 5. Frontend Setup & Startup
In a new terminal window:
```bash
cd client
cp .env.example .env
npm install

# Start frontend development server
npm run dev
```
Frontend client will start on: **`http://localhost:5173`**

---

## ⚙️ Environment Variable Configuration

### Server Configuration (`server/.env`)

```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Security & Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d

# Database Configuration (Option A: Individual Local Parameters)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hms_db
DB_USER=hms_user
DB_PASSWORD=hms_password

# Database Configuration (Option B: Connection String for Neon / Render / Supabase)
# DATABASE_URL=postgres://user:password@ep-host.region.neon.tech/neondb?sslmode=require
```

### Client Configuration (`client/.env`)

```ini
# Base URL for Express REST API
VITE_API_URL=http://localhost:5000/api
```

---

## 🗄️ Database Setup & Schema

The relational schema is defined in [`server/src/db/schema.sql`](file:///C:/Users/admin/.gemini/antigravity/scratch/hospital-management-system/server/src/db/schema.sql) and consists of 14 normalized tables:

```
users (id, email, password_hash, role, first_name, last_name, phone, is_active)
  ├── doctors (id, user_id, department_id, specialization, consultation_fee, bio)
  │     ├── doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, max_patients)
  │     └── appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status)
  │           └── medical_records (id, appointment_id, patient_id, doctor_id, diagnosis, ...)
  │                 └── prescriptions (id, medical_record_id, patient_id, doctor_id, ...)
  │                       └── prescription_items (id, prescription_id, medicine_name, dosage, ...)
  ├── patients (id, user_id, mrn, date_of_birth, gender, blood_group, emergency_contact)
  │     └── bills (id, patient_id, appointment_id, total_amount, paid_amount, status)
  │           ├── bill_items (id, bill_id, description, amount)
  │           └── payments (id, bill_id, amount_paid, payment_method, transaction_ref)
  └── departments (id, name, description, location_floor)
```

- **Conflict Prevention Index**: `CONSTRAINT unique_doctor_time UNIQUE(doctor_id, appointment_date, appointment_time)` prevents double-booking at the database engine level.
- **Auditing & Deactivation**: Soft deactivation fields (`is_active` on `users`) preserve referential integrity for historic patient medical records.

---

## 📡 REST API Documentation

All API routes (except `/api/health`, `/api/auth/login`, and `/api/auth/register`) require an HTTP header:  
`Authorization: Bearer <jwt_token>`

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new patient account and issue token |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT |
| `GET` | `/api/auth/me` | Protected | Return currently logged-in user profile |

### Patients (`/api/patients`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/patients?search=&limit=&page=` | `ADMIN`, `DOCTOR`, `RECEPTIONIST` | Search and paginate patient records |
| `POST` | `/api/patients` | `ADMIN`, `RECEPTIONIST` | Create new patient record with auto-generated MRN |
| `GET` | `/api/patients/:id` | Protected | Retrieve detailed patient record |
| `PUT` | `/api/patients/:id` | `ADMIN`, `RECEPTIONIST` | Update patient demographic profile |
| `PATCH`| `/api/patients/:id/deactivate` | `ADMIN`, `RECEPTIONIST` | Soft-deactivate patient account |

### Appointments (`/api/appointments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/appointments?date=&status=&doctorId=&patientId=` | Protected | Retrieve filtered appointments list |
| `POST` | `/api/appointments` | `ADMIN`, `RECEPTIONIST`, `PATIENT` | Book appointment with conflict check |
| `PATCH`| `/api/appointments/:id/status` | `ADMIN`, `DOCTOR`, `RECEPTIONIST` | Update visit status (`Confirmed`, `Completed`, etc.) |

### Medical Records & Prescriptions
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/records?patientId=` | `ADMIN`, `DOCTOR`, `PATIENT` | List clinical records (role isolated) |
| `POST` | `/api/records` | `ADMIN`, `DOCTOR` | Record clinical symptoms and diagnosis |
| `GET` | `/api/prescriptions?patientId=` | `ADMIN`, `DOCTOR`, `PATIENT` | Retrieve prescriptions with medication items |
| `POST` | `/api/prescriptions` | `ADMIN`, `DOCTOR` | Issue multi-item prescription (atomic transaction) |

### Billing & Financial Ledgers (`/api/bills`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bills?patientId=&status=` | `ADMIN`, `RECEPTIONIST`, `PATIENT` | Retrieve billing ledgers with line items |
| `POST` | `/api/bills` | `ADMIN`, `RECEPTIONIST` | Generate invoice with line items |
| `POST` | `/api/bills/:id/payments` | `ADMIN`, `RECEPTIONIST` | Record payment against invoice with overpayment check |

### Analytics & System Health
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Protected | Role-tailored dashboard metrics and financial totals |
| `GET` | `/api/health` | Public | System status, uptime, and database connectivity check |

---

## 🧪 Testing & Quality Assurance

PulseCare HMS includes a comprehensive automated test suite built with Node's native test runner (`node:test`) and `supertest`.

### Executing Tests
```bash
cd server
npm test
```

### Verified Test Coverage (56 Tests Passing)

```
✔ WORKFLOW (13 tests): Patient intake, validation, conflict prevention, status transitions
✔ BILLING (13 tests): Multi-item invoice creation, payment recording, overpayment rejection, appointment linking
✔ SECURITY & RBAC (14 tests): Cross-role boundaries, privilege escalation rejection, parameter sanitization
✔ AUTHENTICATION (10 tests): bcrypt hashing, token validation, malformed credentials
✔ DATABASE EXPLORER (6 tests): Connection pool recovery, relational constraints, foreign keys
```

### Frontend Code Quality
```bash
cd client
npm run lint    # Executed via Oxlint: 0 errors
npm run build   # Vite production build: ✓ built in ~390ms
```

---

## ☁️ Cloud Deployment Guide

The production system is deployed across modern cloud infrastructure:

- **Frontend Web Application (Vercel)**: [https://pulsecare-hms.vercel.app](https://pulsecare-hms.vercel.app)
- **Backend Web Service (Render)**: [https://pulsecare-hms-api.onrender.com](https://pulsecare-hms-api.onrender.com)
- **System Health Endpoint**: [https://pulsecare-hms-api.onrender.com/api/health](https://pulsecare-hms-api.onrender.com/api/health)
- **Database Engine**: Neon Serverless Cloud PostgreSQL

### 1. Database (Neon Cloud PostgreSQL)
1. Create a free project at [Neon](https://neon.tech).
2. Copy the pooled connection string (`postgres://...sslmode=require`).
3. Run the schema and seed scripts against Neon using `psql` or Neon SQL Editor.

### 2. Backend Web Service (Render)
1. Connect your GitHub repository to [Render](https://render.com).
2. Choose **Blueprint** deployment — Render will automatically read [`render.yaml`](file:///C:/Users/admin/.gemini/antigravity/scratch/hospital-management-system/render.yaml).
3. Set the environment variables in the Render Dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `CLIENT_URL`: `https://pulsecare-hms.vercel.app`
   - `JWT_SECRET`: Auto-generated or custom secure string.
4. Render monitors `https://pulsecare-hms-api.onrender.com/api/health` for automated zero-downtime health checks.

### 3. Frontend Web Application (Vercel)
1. Connect your repository to [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Configure environment variable:
   - `VITE_API_URL`: `https://pulsecare-hms-api.onrender.com/api`
5. [`vercel.json`](file:///C:/Users/admin/.gemini/antigravity/scratch/hospital-management-system/vercel.json) handles client-side SPA routing (`/*` $\rightarrow$ `/index.html`).

---

## 🔒 Security Architecture & Audit

A comprehensive repository security audit confirms:
- **No Committed Secrets**: `.env` files are strictly excluded via `.gitignore` (`server/.env` is ignored; only `.env.example` templates exist in source control).
- **Password Protection**: Passwords are never stored in plaintext; all user passwords use `bcryptjs` one-way salted hashing.
- **SQL Injection Prevention**: All database queries across all controllers utilize parameterized queries (`$1`, `$2`, etc.), preventing SQL injection vulnerabilities.
- **Overpayment Guardrails**: Payment operations calculate current outstanding balances in a database transaction before accepting payment.
- **Stateless Tokens**: Signed JWTs prevent server-side session hijacking and expire after configurable durations (`JWT_EXPIRES_IN=7d`).
- **Role Isolation**: Patients cannot access other patients' records or invoices; doctor/patient profiles cannot deactivate administrative entities.

---

## 🖼️ Screenshots & UI Showcase

*(Screenshots can be added to `/docs/screenshots/` and referenced below)*

| View | Description |
| :--- | :--- |
| **Admin Dashboard** | Real-time overview of hospital admissions, revenue, and active clinicians |
| **Appointments & Booking** | Scheduling calendar with conflict detection and status updates |
| **Billing & Invoices** | Multi-item billing ledger with payment recording modal |
| **Clinical EMR & Prescriptions** | Physician examination forms and structured medication orders |

---

## ⚠️ Known Limitations & Future Improvements

### Current Limitations
1. **Notifications**: The `notifications` table exists in PostgreSQL, but live in-app push alerts currently poll on refresh rather than via real-time WebSockets.
2. **Rate Limiting**: The current rate limiter middleware operates in-memory; for multi-instance production clustering, a Redis-backed store (e.g. `express-rate-limit` with Redis) is recommended.
3. **Receipt Generation**: Invoices are displayed and persisted in the web ledger; native PDF generation (e.g. via PDFKit) is not yet integrated.

### Roadmap for Future Releases
- [ ] Real-time notifications and chat via WebSockets (`Socket.io`).
- [ ] Automated PDF export for invoices and prescription slips.
- [ ] Laboratory and Diagnostic Imaging (DICOM) attachment uploads via S3 / Cloud Storage.
- [ ] Multi-hospital branch tenancy and ward/bed occupancy management.

---

## 👨‍💻 Author & Contributions

- **Project Lead**: PulseCare Development Team
- **Course / Context**: Advanced Full-Stack Software Engineering Capstone
- **GitHub Repository**: [https://github.com/anushkayadav8870-rgb/hospital-management-system](https://github.com/anushkayadav8870-rgb/hospital-management-system)
- **Live Application**: [https://pulsecare-hms.vercel.app](https://pulsecare-hms.vercel.app)
- **Contributions**: Contributions, issues, and feature suggestions are welcome. Please open a pull request or issue on GitHub.
- **License**: Released under the [ISC License](file:///C:/Users/admin/.gemini/antigravity/scratch/hospital-management-system/server/package.json#L17).

# PulseCare Hospital Management System (HMS)

> A modern, full-stack web-based Hospital Management System built with React, Node.js, Express, and PostgreSQL.

---

## 🚀 Features

- **Dashboard**: Role-tailored metrics for Admin, Doctor, and Patient views.
- **Patient Management**: Registration, MRN auto-generation (`PAT-YYYY-XXXX`), search, profile updates, soft deactivation.
- **Doctor & Department Management**: Medical staff directory, specializations, consultation fee management, department assignments with SQL JOIN queries.
- **Appointments & Scheduling**: Scheduling conflict prevention engine, visit booking, status state machine (`Scheduled` → `Confirmed` → `Completed` / `Cancelled`).
- **Medical Records (EMR)**: Structured clinical examination entries (symptoms, primary diagnosis, treatment plan, doctor notes) with patient privacy rules.
- **Prescriptions**: Master-detail medication orders, atomic SQL transactions (`BEGIN`/`COMMIT`/`ROLLBACK`), dynamic multi-row medicine item entry.
- **Billing & Invoicing**: Financial invoice generation, line-item breakdowns, payment ledgers, dynamic status recalculations (`Pending`, `Partially Paid`, `Paid`).
- **Authentication & RBAC**: `bcryptjs` password salt hashing, stateless `JWT` tokens, role-based authorization for `ADMIN`, `DOCTOR`, `RECEPTIONIST`, and `PATIENT`.
- **C Language Companion Suite**: Educational low-level modules in `/c-algorithms` covering memory layout, binary file I/O, and triage sorting.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v7, Custom CSS Design System
- **Backend**: Node.js, Express.js, bcryptjs, JSON Web Tokens (JWT)
- **Database**: PostgreSQL 16+ (`pg` Pool connection pooling)
- **Companion Suite**: C (MinGW GCC)

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+) & npm
- PostgreSQL (v14+)

### 2. Database Initialization
```bash
# Create database and user in PostgreSQL
psql -U postgres -c "CREATE DATABASE hms_db;"
psql -U postgres -c "CREATE USER hms_user WITH PASSWORD 'hms_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE hms_db TO hms_user;"

# Load DDL schema and seed data
psql -U hms_user -d hms_db -f server/src/db/schema.sql
psql -U hms_user -d hms_db -f server/src/db/seed.sql
```

### 3. Start Express Backend API (Port 5000)
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 4. Start React Frontend (Port 5173)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5000/api/health`

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@pulsecare.com` | `password123` |
| **Doctor** | `dr.jenkins@pulsecare.com` | `password123` |
| **Receptionist** | `reception@pulsecare.com` | `password123` |
| **Patient** | `eleanor.vance@email.com` | `password123` |

---

## 🌐 Public Cloud Deployment Guide

- **Frontend Hosting**: Vercel (Vite SPA)
- **Backend Hosting**: Render / Railway (Express Node.js Web Service)
- **Database Hosting**: Render PostgreSQL / Neon PostgreSQL Cloud DB

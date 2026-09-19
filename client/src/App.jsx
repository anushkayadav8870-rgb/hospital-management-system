// =============================================
// client/src/App.jsx
//
// CONCEPT: React Router & Application Structure
// =============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Page Imports
import Dashboard from './pages/dashboard/Dashboard';
import Patients from './pages/patients/Patients';
import Doctors from './pages/doctors/Doctors';
import Appointments from './pages/appointments/Appointments';
import MedicalRecords from './pages/emr/MedicalRecords';
import Prescriptions from './pages/prescriptions/Prescriptions';
import Login from './pages/auth/Login';

function AuthenticatedLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Application Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/patients"
            element={
              <AuthenticatedLayout>
                <Patients />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/doctors"
            element={
              <AuthenticatedLayout>
                <Doctors />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/appointments"
            element={
              <AuthenticatedLayout>
                <Appointments />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/records"
            element={
              <AuthenticatedLayout>
                <MedicalRecords />
              </AuthenticatedLayout>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <AuthenticatedLayout>
                <Prescriptions />
              </AuthenticatedLayout>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

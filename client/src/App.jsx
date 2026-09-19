// =============================================
// client/src/App.jsx
//
// CONCEPT: React Router & Application Structure
// =============================================
// React Router manages navigation between views:
//   - <BrowserRouter> keeps UI in sync with browser URL
//   - <Routes> renders the first <Route> that matches URL
//   - Layout wrapper embeds Sidebar & Navbar on internal pages
// =============================================

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Page Imports
import Dashboard from './pages/dashboard/Dashboard';
import Patients from './pages/patients/Patients';
import Doctors from './pages/doctors/Doctors';
import Appointments from './pages/appointments/Appointments';
import Login from './pages/auth/Login';

// Helper component to wrap authenticated pages with Layout
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

          {/* Authenticated Application Routes (Wrapped in Layout) */}
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

          {/* Catch-all redirect to /dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

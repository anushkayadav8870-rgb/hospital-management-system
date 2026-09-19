// =============================================
// client/src/components/layout/Navbar.jsx
//
// CONCEPT: useLocation for dynamic page titles
// =============================================
// The top bar shows the current page name dynamically.
// useLocation() gives us the current path, and we use a
// lookup object to convert "/patients" → "Patients".
// =============================================

import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Map URL paths to human-readable page titles
const pageTitles = {
  '/dashboard':     { title: 'Dashboard',         subtitle: 'Overview & key metrics' },
  '/patients':      { title: 'Patients',           subtitle: 'Manage patient records' },
  '/doctors':       { title: 'Doctors',            subtitle: 'Manage medical staff' },
  '/appointments':  { title: 'Appointments',       subtitle: 'Schedule & manage appointments' },
  '/records':       { title: 'Medical Records',    subtitle: 'Electronic health records (EMR)' },
  '/prescriptions': { title: 'Prescriptions',      subtitle: 'Medication orders & history' },
  '/billing':       { title: 'Billing',            subtitle: 'Invoices & payments' },
  '/analytics':     { title: 'Analytics',          subtitle: 'Reports & statistics' },
  '/users':         { title: 'User Management',    subtitle: 'Accounts & roles' },
  '/departments':   { title: 'Departments',        subtitle: 'Hospital departments' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Look up title for current path, fallback to generic
  const page = pageTitles[pathname] || { title: 'PulseCare HMS', subtitle: '' };

  return (
    <header className="navbar">
      {/* Left: Dynamic page title */}
      <div className="navbar-left">
        <div className="page-title">{page.title}</div>
        {page.subtitle && (
          <div className="page-breadcrumb">{page.subtitle}</div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="navbar-right">
        {/* Notifications bell — functionality added in a later phase */}
        <button className="navbar-btn" title="Notifications" aria-label="Notifications">
          🔔
          {/* Notification dot indicator */}
          <span className="notification-dot" />
        </button>

        {/* Settings */}
        <button className="navbar-btn" title="Settings" aria-label="Settings">
          ⚙️
        </button>

        {/* Logged-in user chip */}
        <div
          className="flex items-center gap-2"
          style={{ marginLeft: '8px', paddingLeft: '12px', borderLeft: '1px solid var(--color-border)' }}
        >
          <div className="avatar" title={user?.email}>
            {user?.initials || '?'}
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

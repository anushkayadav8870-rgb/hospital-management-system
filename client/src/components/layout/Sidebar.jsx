// =============================================
// client/src/components/layout/Sidebar.jsx
//
// CONCEPT: useState, useLocation, NavLink
// =============================================
// The sidebar is the main navigation. It uses:
//
// - React Router's <NavLink> — like a regular HTML <a> link, but
//   it automatically adds an "active" class when the current URL
//   matches the link's path. No manual checking needed!
//
// - useLocation() — a React Router hook that gives us the current
//   URL path (e.g., "/patients"). We use it to highlight the
//   correct nav item.
//
// - useAuth() — reads the logged-in user from our AuthContext.
// =============================================

import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// -----------------------------------------------
// Navigation Configuration
// -----------------------------------------------
// Defining routes as DATA (an array of objects) instead of
// hardcoding NavLinks in JSX is a key React pattern.
// To add a new nav item, you only need to add one object here.
const navItems = [
  { path: '/dashboard',    label: 'Dashboard',       icon: '📊' },
  { path: '/patients',     label: 'Patients',         icon: '🏥' },
  { path: '/doctors',      label: 'Doctors',          icon: '👨‍⚕️' },
  { path: '/appointments', label: 'Appointments',     icon: '📅' },
  { path: '/records',      label: 'Medical Records',  icon: '📋' },
  { path: '/prescriptions',label: 'Prescriptions',    icon: '💊' },
  { path: '/billing',      label: 'Billing',          icon: '💳' },
];

const adminItems = [
  { path: '/analytics',    label: 'Analytics',        icon: '📈' },
  { path: '/users',        label: 'User Management',  icon: '👥' },
  { path: '/departments',  label: 'Departments',      icon: '🏢' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar">
      {/* ---- Hospital Logo ---- */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">P</div>
          <div className="logo-text">
            <h1>PulseCare</h1>
            <p>Hospital System</p>
          </div>
        </div>
      </div>

      {/* ---- Navigation Links ---- */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>

        {/*
          CONCEPT: .map() to render a list from an array
          We loop over navItems and return a <NavLink> for each.
          The "key" prop is required by React to efficiently update lists.
          React uses it to track which items changed.
        */}
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              // NavLink passes { isActive } to the className function.
              // If the URL matches this link's path, isActive is true.
              isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/*
          CONDITIONAL RENDERING: Only show admin items if user is ADMIN.
          The && operator: if left side is true, render right side.
          If left side is false, render nothing.
        */}
        {user?.role === 'ADMIN' && (
          <>
            <div className="nav-section-label" style={{ marginTop: '8px' }}>
              Administration
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  isActive ? 'nav-item active' : 'nav-item'
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* ---- User Profile Footer ---- */}
      <div className="sidebar-footer">
        <div className="sidebar-user" onClick={logout} title="Click to logout">
          <div className="user-avatar">{user?.initials || '?'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Guest'}</div>
            <div className="user-role">{user?.role || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

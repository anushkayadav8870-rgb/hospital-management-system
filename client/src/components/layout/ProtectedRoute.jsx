// =============================================
// client/src/components/layout/ProtectedRoute.jsx
// Shielded Route wrapper for React Router
// =============================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading CareSync workspace...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login preserving attempted location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check: if route requires specific roles and current user is not authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Access Restricted</h2>
        <p>Your role ({user.role}) does not have permission to access this area.</p>
      </div>
    );
  }

  return children;
}

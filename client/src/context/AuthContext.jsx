// =============================================
// client/src/context/AuthContext.jsx
// JWT Authentication Context Provider
// =============================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    name: 'Dr. Admin User',
    role: 'ADMIN',
    email: 'admin@pulsecare.com',
    initials: 'AU',
  });
  const [loading, setLoading] = useState(false);

  // Check if token exists on mount and verify profile
  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    if (token) {
      authService
        .getMe()
        .then((res) => {
          if (res.success && res.data.user) {
            const u = res.data.user;
            setUser({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`,
              role: u.role,
              email: u.email,
              initials: u.initials,
            });
          }
        })
        .catch(() => {
          // If token invalid or expired, clear storage
          localStorage.removeItem('hms_token');
        });
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const { token, user: u } = res.data;
        localStorage.setItem('hms_token', token);
        const userObj = {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          role: u.role,
          email: u.email,
          initials: u.initials,
        };
        setUser(userObj);
        setLoading(false);
        return { success: true };
      }
    } catch (err) {
      setLoading(false);
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

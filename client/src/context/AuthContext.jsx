// =============================================
// client/src/context/AuthContext.jsx
//
// CONCEPT: React Context API
// =============================================
// Problem: We need to know "who is logged in?" in many components:
//   - Sidebar shows the user's name and role
//   - Navbar shows logout button
//   - Pages show/hide features based on role
//
// Without Context, we'd have to pass the user data as props
// through every component in the tree — called "prop drilling".
//
// Context solves this: it creates a "global store" that any
// component can read from directly, no matter how deep it is.
//
// HOW IT WORKS:
//   1. We create a Context object (like creating a channel)
//   2. We wrap the app in a Provider (like broadcasting on that channel)
//   3. Any component uses useContext() to "tune in" to that channel
// =============================================

import { createContext, useContext, useState } from 'react';

// Step 1: Create the Context
// This is just an empty container — a channel with no signal yet.
const AuthContext = createContext(null);

// Step 2: Create the Provider Component
// This component wraps the entire app and makes auth data available everywhere.
// "value" is what we're broadcasting to all child components.
export function AuthProvider({ children }) {
  // For now, we use mock data so the UI works before the backend auth is built.
  // In Phase 5, we'll replace this with real login/logout API calls.
  const [user, setUser] = useState({
    id: 1,
    name: 'Dr. Admin User',
    role: 'ADMIN',
    email: 'admin@pulsecare.com',
    initials: 'AU',
  });

  // login() will eventually call POST /api/auth/login
  const login = (userData) => {
    setUser(userData);
  };

  // logout() will clear user state and remove the JWT token
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Custom hook — a convenience wrapper around useContext
// Components call useAuth() instead of useContext(AuthContext) directly.
// This gives a cleaner, more readable API.
export function useAuth() {
  return useContext(AuthContext);
}

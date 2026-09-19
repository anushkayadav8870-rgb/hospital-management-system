// =============================================
// client/src/pages/auth/Login.jsx
//
// CONCEPT: Forms, Controlled Inputs, Events
// =============================================
// In React, form inputs are "controlled":
//   1. We hold input values in React state (`useState`)
//   2. The input's `value` attribute is tied to state
//   3. The input's `onChange` event updates state as the user types
//
// This ensures React is the single source of truth for form data.
// =============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('admin@pulsecare.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    // Prevent standard browser form submission (which reloads the whole page!)
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    // Mock login for frontend phase
    login({
      id: 1,
      name: 'Dr. Admin User',
      role: 'ADMIN',
      email: email,
      initials: 'AU',
    });

    // Navigate programmatically to the dashboard
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">P</div>
          <h1>PulseCare HMS</h1>
          <p>Sign in to your hospital workspace</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@hospital.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '8px' }}>
            Sign In →
          </Button>
        </form>
      </div>
    </div>
  );
}

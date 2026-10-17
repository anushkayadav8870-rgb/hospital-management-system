import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Validate form fields client-side before sending network request
  const validate = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = 'Please enter a valid email address (e.g. staff@hospital.com).';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    if (submitting) return;

    if (!validate()) {
      return;
    }

    const trimmedEmail = email.trim();
    setSubmitting(true);

    try {
      const result = await login(trimmedEmail, password);
      if (result && result.success) {
        setSuccessMessage('Authentication verified. Redirecting to workspace...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      } else {
        setSubmitting(false);
        setGeneralError(result?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setSubmitting(false);
      setGeneralError(err.message || 'Authentication service error. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Healthcare Medical Logo & Branding */}
        <div className="login-logo">
          <div className="medical-logo-badge" aria-hidden="true">
            <svg
              className="medical-cross-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="MediCore Medical Cross Logo"
            >
              <rect width="24" height="24" rx="6" fill="#0d9488" />
              <path
                d="M10.5 5.5H13.5V10.5H18.5V13.5H13.5V18.5H10.5V13.5H5.5V10.5H10.5V5.5Z"
                fill="#ffffff"
              />
            </svg>
          </div>
          <h1>MediCore</h1>
          <div className="brand-subtitle">Hospital Management System</div>
          <p className="login-instructions">
            Enter your authorized clinical credentials to access your portal.
          </p>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="alert alert-danger" role="alert" aria-live="polite">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{generalError}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="alert alert-success" role="status" aria-live="polite">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Clinical Email Address <span className="text-required">*</span>
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${fieldErrors.email ? 'input-error' : ''}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: null }));
                }
                if (generalError) setGeneralError('');
              }}
              placeholder="e.g. staff.member@hospital.com"
              maxLength={255}
              autoComplete="email"
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="form-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">
                Password <span className="text-required">*</span>
              </label>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${fieldErrors.password ? 'input-error' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: null }));
                  }
                  if (generalError) setGeneralError('');
                }}
                placeholder="Enter your confidential password"
                maxLength={128}
                autoComplete="current-password"
                disabled={submitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                disabled={submitting}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="form-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="btn-login-submit"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {submitting ? (
              <span className="submit-loading-text">
                <span className="spinner-sm" aria-hidden="true" />
                Signing In...
              </span>
            ) : (
              'Sign In to Workspace'
            )}
          </Button>
        </form>

        {/* Security & Support Note */}
        <div className="login-footer-info">
          <div className="security-notice">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Authorized Clinical Personnel Only • HIPAA Compliant Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}


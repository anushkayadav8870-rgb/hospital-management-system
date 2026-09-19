// =============================================
// client/src/services/api.js
// Centralized HTTP Client Wrapper for REST API
// =============================================

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper to execute HTTP requests
 * Automatically attaches Authorization: Bearer <token> if present in localStorage
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('hms_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication Service Calls
export const authService = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => apiRequest('/auth/me'),
};

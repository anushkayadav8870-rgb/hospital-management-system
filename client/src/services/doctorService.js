// =============================================
// client/src/services/doctorService.js
// Frontend Doctor & Department API Service Client
// =============================================

import { apiRequest } from './api';

export const doctorService = {
  getDoctors: (departmentId = '', search = '') => {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/doctors${queryString}`);
  },

  getDoctorById: (id) => apiRequest(`/doctors/${id}`),

  createDoctor: (doctorData) =>
    apiRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    }),

  updateDoctor: (id, doctorData) =>
    apiRequest(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData),
    }),

  deactivateDoctor: (id) =>
    apiRequest(`/doctors/${id}/deactivate`, {
      method: 'PATCH',
    }),

  getDepartments: () => apiRequest('/departments'),

  createDepartment: (deptData) =>
    apiRequest('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData),
    }),
};

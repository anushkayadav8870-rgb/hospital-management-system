// =============================================
// client/src/services/patientService.js
// Frontend Patient API Service Client
// =============================================

import { apiRequest } from './api';

export const patientService = {
  getPatients: (params = {}) => {
    if (typeof params === 'string') {
      params = { search: params };
    }
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiRequest(`/patients${queryString}`);
  },

  getPatientById: (id) => apiRequest(`/patients/${id}`),

  createPatient: (patientData) =>
    apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),

  updatePatient: (id, patientData) =>
    apiRequest(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    }),

  deactivatePatient: (id) =>
    apiRequest(`/patients/${id}/deactivate`, {
      method: 'PATCH',
    }),
};

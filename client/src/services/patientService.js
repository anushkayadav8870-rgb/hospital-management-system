// =============================================
// client/src/services/patientService.js
// Frontend Patient API Service Client
// =============================================

import { apiRequest } from './api';

export const patientService = {
  getPatients: (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/patients${query}`);
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

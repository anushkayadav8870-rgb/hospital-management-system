// =============================================
// client/src/services/prescriptionService.js
// Frontend Prescription API Service Client
// =============================================

import { apiRequest } from './api';

export const prescriptionService = {
  getPrescriptions: (patientId = '') => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest(`/prescriptions${query}`);
  },

  getPrescriptionById: (id) => apiRequest(`/prescriptions/${id}`),

  createPrescription: (prescriptionData) =>
    apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    }),
};

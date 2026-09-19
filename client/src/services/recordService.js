// =============================================
// client/src/services/recordService.js
// Frontend EMR API Service Client
// =============================================

import { apiRequest } from './api';

export const recordService = {
  getMedicalRecords: (patientId = '') => {
    const query = patientId ? `?patientId=${patientId}` : '';
    return apiRequest(`/records${query}`);
  },

  getRecordById: (id) => apiRequest(`/records/${id}`),

  createMedicalRecord: (recordData) =>
    apiRequest('/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    }),
};

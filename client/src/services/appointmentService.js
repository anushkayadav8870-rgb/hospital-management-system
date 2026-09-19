// =============================================
// client/src/services/appointmentService.js
// Frontend Appointment API Service Client
// =============================================

import { apiRequest } from './api';

export const appointmentService = {
  getAppointments: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.status) params.append('status', filters.status);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    if (filters.patientId) params.append('patientId', filters.patientId);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/appointments${queryString}`);
  },

  bookAppointment: (bookingData) =>
    apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  updateStatus: (id, status, notes = '') =>
    apiRequest(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
};

// =============================================
// client/src/services/billingService.js
// Frontend Billing API Service Client
// =============================================

import { apiRequest } from './api';

export const billingService = {
  getBills: (status = '') => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/bills${query}`);
  },

  createBill: (billData) =>
    apiRequest('/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    }),

  recordPayment: (billId, paymentData) =>
    apiRequest(`/bills/${billId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};

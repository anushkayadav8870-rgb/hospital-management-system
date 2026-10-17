// =============================================
// client/src/services/analyticsService.js
// Frontend Analytics & Dashboard API Service Client
// =============================================

import { apiRequest } from './api';

export const analyticsService = {
  getDashboardMetrics: () => apiRequest('/analytics/dashboard'),

  getDatabaseViewer: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/db-viewer${query ? `?${query}` : ''}`);
  },
};

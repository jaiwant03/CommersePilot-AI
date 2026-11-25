import api from './api';

/**
 * Workspace Service for CommercePilot AI
 * Connects frontend authenticated views and public verification views to MongoDB endpoints
 */
const workspaceService = {
  // Overview
  getOverview: async () => {
    const res = await api.get('/overview');
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/overview/notifications');
    return res.data;
  },

  seedDemoData: async (data = {}) => {
    const res = await api.post('/overview/seed-demo', data);
    return res.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data;
  },

  updateProduct: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  updateOrder: async (id, orderData) => {
    const res = await api.put(`/orders/${id}`, orderData);
    return res.data;
  },

  deleteOrder: async (id) => {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },

  approveOrder: async (id) => {
    const res = await api.post(`/orders/${id}/approve`);
    return res.data;
  },

  requestOrderConfirmation: async (id) => {
    const res = await api.post(`/orders/${id}/request-confirmation`);
    return res.data;
  },

  flagOrderForReview: async (id, data = {}) => {
    const res = await api.post(`/orders/${id}/flag-review`, data);
    return res.data;
  },

  markOrderReviewed: async (id) => {
    const res = await api.post(`/orders/${id}/mark-reviewed`);
    return res.data;
  },

  analyzeOrderRisk: async (id) => {
    const res = await api.post(`/orders/${id}/analyze-risk`);
    return res.data;
  },

  // Deliveries
  getDeliveries: async (params = {}) => {
    const res = await api.get('/deliveries', { params });
    return res.data;
  },

  getDeliveryById: async (id) => {
    const res = await api.get(`/deliveries/${id}`);
    return res.data;
  },

  getWhatsAppPreview: async (deliveryId) => {
    const res = await api.get(`/deliveries/${deliveryId}/whatsapp-preview`);
    return res.data;
  },

  simulateWhatsAppReply: async (deliveryId, reply) => {
    const res = await api.post(`/deliveries/${deliveryId}/whatsapp-reply`, { reply });
    return res.data;
  },

  simulateDeliveryEvent: async (deliveryId, eventData) => {
    const res = await api.post(`/deliveries/${deliveryId}/events`, eventData);
    return res.data;
  },

  // Inventory
  getInventory: async (params = {}) => {
    const res = await api.get('/inventory', { params });
    return res.data;
  },

  adjustStock: async (adjustmentData) => {
    const res = await api.post('/inventory/adjust', adjustmentData);
    return res.data;
  },

  getInventoryMovements: async (params = {}) => {
    const res = await api.get('/inventory/movements', { params });
    return res.data;
  },

  getDemandForecast: async (params = {}) => {
    const res = await api.get('/inventory/forecast', { params });
    return res.data;
  },

  getPurchaseOrders: async (params = {}) => {
    const res = await api.get('/inventory/purchase-orders', { params });
    return res.data;
  },

  getPurchaseOrderById: async (id) => {
    const res = await api.get(`/inventory/purchase-orders/${id}`);
    return res.data;
  },

  approvePurchaseOrder: async (id) => {
    const res = await api.post(`/inventory/purchase-orders/${id}/approve`);
    return res.data;
  },

  updatePurchaseOrder: async (id, data) => {
    const res = await api.patch(`/inventory/purchase-orders/${id}`, data);
    return res.data;
  },

  rejectPurchaseOrder: async (id, data = {}) => {
    const res = await api.post(`/inventory/purchase-orders/${id}/reject`, data);
    return res.data;
  },

  // Analytics & Demand Forecasting
  getAnalytics: async (params = {}) => {
    const res = await api.get('/analytics', { params });
    return res.data;
  },

  getForecasts: async (params = {}) => {
    const res = await api.get('/analytics/forecasts', { params });
    return res.data;
  },

  // AI Assistant Copilot
  chatAssistant: async (prompt) => {
    const res = await api.post('/assistant/chat', { prompt });
    return res.data;
  },

  // Automations & n8n Workflows
  getAutomations: async (params = {}) => {
    const res = await api.get('/automations', { params });
    return res.data;
  },

  getWorkflowStatuses: async () => {
    const res = await api.get('/automations/status');
    return res.data;
  },

  triggerOrderAnalysis: async (orderId) => {
    const res = await api.post(`/automations/trigger/order-analysis/${orderId}`);
    return res.data;
  },

  triggerInventoryAnalysis: async () => {
    const res = await api.post('/automations/trigger/inventory-analysis');
    return res.data;
  },

  triggerDeliveryRecovery: async (deliveryId) => {
    const res = await api.post(`/automations/trigger/delivery-recovery/${deliveryId}`);
    return res.data;
  },

  triggerDailyReport: async () => {
    const res = await api.post('/automations/trigger/daily-report');
    return res.data;
  },

  // Verification & Public Email Action Endpoints
  getTokenInfo: async (token) => {
    const res = await api.get('/verification/token-info', { params: { token } });
    return res.data;
  },

  confirmOrderAction: async (token, action) => {
    const res = await api.post('/verification/confirm-order', { token, action });
    return res.data;
  },

  rescheduleDeliveryAction: async (payload) => {
    const res = await api.post('/verification/reschedule-delivery', payload);
    return res.data;
  },

  approvePoAction: async (token, action) => {
    const res = await api.post('/verification/approve-po', { token, action });
    return res.data;
  },

  // Store Settings
  getSettings: async () => {
    const res = await api.get('/settings');
    return res.data;
  },

  updateSettings: async (settingsData) => {
    const res = await api.put('/settings', settingsData);
    return res.data;
  },

  importStoreData: async (importPayload) => {
    const res = await api.post('/settings/import-data', importPayload);
    return res.data;
  }
};

export default workspaceService;

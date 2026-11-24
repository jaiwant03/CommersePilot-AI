const mongoose = require('mongoose');
const config = require('../config/env');

/**
 * Health check controller providing system telemetry
 */
const getHealthStatus = (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const dbState = dbStatusMap[mongoose.connection.readyState] || 'unknown';
  const isDbHealthy = mongoose.connection.readyState === 1;

  const statusCode = isDbHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: isDbHealthy,
    service: 'CommercePilot AI API',
    status: isDbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.env,
    system: {
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    integrations: {
      database: dbState,
      groqConfigured: Boolean(config.groqApiKey),
      n8nOrderWebhookConfigured: Boolean(config.n8n.orderWebhookUrl),
      n8nInventoryWebhookConfigured: Boolean(config.n8n.inventoryWebhookUrl),
      n8nDeliveryWebhookConfigured: Boolean(config.n8n.deliveryWebhookUrl),
      n8nReportWebhookConfigured: Boolean(config.n8n.reportWebhookUrl),
      smtpConfigured: Boolean(config.smtp.host && config.smtp.user)
    }
  });
};

const ping = (req, res) => {
  res.status(200).json({ success: true, message: 'pong' });
};

module.exports = {
  getHealthStatus,
  ping
};

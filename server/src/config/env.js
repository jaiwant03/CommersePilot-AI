const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/commercepilot_ai',
  jwtSecret: process.env.JWT_SECRET || 'commercepilot_fallback_dev_jwt_secret_phase2_2026',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  groqApiKey: process.env.GROQ_API_KEY || '',
  n8n: {
    orderWebhookUrl: process.env.N8N_ORDER_WEBHOOK_URL || '',
    inventoryWebhookUrl: process.env.N8N_INVENTORY_WEBHOOK_URL || '',
    deliveryWebhookUrl: process.env.N8N_DELIVERY_WEBHOOK_URL || '',
    reportWebhookUrl: process.env.N8N_REPORT_WEBHOOK_URL || '',
    webhookSecret: process.env.N8N_WEBHOOK_SECRET || 'commercepilot_n8n_secret'
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'no-reply@commercepilot.ai'
  }
};

module.exports = config;

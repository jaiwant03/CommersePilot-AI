const axios = require('axios');
const config = require('../config/env');

/**
 * Dispatch operational events to n8n automation webhooks
 */
const triggerN8nWebhook = async (webhookType, payload) => {
  let targetUrl = '';

  switch (webhookType) {
    case 'order':
      targetUrl = config.n8n.orderWebhookUrl;
      break;
    case 'inventory':
      targetUrl = config.n8n.inventoryWebhookUrl;
      break;
    case 'delivery':
      targetUrl = config.n8n.deliveryWebhookUrl;
      break;
    default:
      throw new Error(`Unknown n8n webhook type: ${webhookType}`);
  }

  if (!targetUrl) {
    console.warn(`[n8n Service] Webhook URL for "${webhookType}" is not configured. Event skipped.`);
    return { skipped: true, reason: 'URL_NOT_CONFIGURED' };
  }

  try {
    const response = await axios.post(targetUrl, {
      source: 'CommercePilot AI',
      timestamp: new Date().toISOString(),
      eventType: webhookType,
      data: payload
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });

    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.error(`[n8n Service] Webhook error (${webhookType}): ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = {
  triggerN8nWebhook
};

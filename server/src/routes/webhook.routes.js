const express = require('express');
const router = express.Router();
const config = require('../config/env');
const Order = require('../models/Order.model');
const Delivery = require('../models/Delivery.model');
const AutomationLog = require('../models/AutomationLog.model');

/**
 * Middleware: Verify n8n Webhook Authenticity
 */
const verifyWebhookAuth = (req, res, next) => {
  const secretHeader = req.headers['x-commercepilot-secret'] || req.headers['authorization'];
  const expectedSecret = config.n8n.webhookSecret;

  if (!secretHeader || (secretHeader !== expectedSecret && secretHeader !== `Bearer ${expectedSecret}`)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing webhook signature/secret.'
    });
  }

  next();
};

router.use(verifyWebhookAuth);

/**
 * Webhook: Receive COD Order Analysis Result from n8n
 */
router.post('/n8n/order-analysis', async (req, res, next) => {
  try {
    const { orderId, decision, riskScore, riskLevel, explanation } = req.body;

    if (!orderId || !decision) {
      return res.status(400).json({ success: false, message: 'orderId and decision are required.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.riskScore = riskScore !== undefined ? riskScore : order.riskScore;
    order.riskLevel = riskLevel || order.riskLevel;
    if (explanation) order.notes = explanation;

    if (decision === 'REQUEST_CONFIRMATION') {
      order.orderStatus = 'ON_HOLD';
      order.needsVerification = true;
      order.history.push({
        status: 'ON_HOLD',
        note: `n8n Webhook Decision: REQUEST_CONFIRMATION (${explanation || 'Hold for email verification'})`
      });
    } else if (decision === 'PROCEED') {
      order.orderStatus = 'CONFIRMED';
      order.needsVerification = false;
      order.history.push({
        status: 'CONFIRMED',
        note: 'n8n Webhook Decision: PROCEED. Approved for packing.'
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber} updated successfully via n8n webhook.`,
      orderId: order._id,
      orderStatus: order.orderStatus
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Webhook: Receive Delivery Recovery Result from n8n
 */
router.post('/n8n/delivery-recovery', async (req, res, next) => {
  try {
    const { deliveryId, recoveryAction, notes } = req.body;

    if (!deliveryId) {
      return res.status(400).json({ success: false, message: 'deliveryId is required.' });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found.' });
    }

    delivery.trackingEvents.push({
      status: 'N8N_RECOVERY_PROCESSED',
      location: delivery.destination?.city || 'Local Hub',
      message: `n8n recovery action executed: ${recoveryAction || 'Customer notification queued'}. ${notes || ''}`,
      timestamp: new Date()
    });

    await delivery.save();

    return res.status(200).json({
      success: true,
      message: `Delivery AWB ${delivery.awb} recovery event recorded.`,
      deliveryId: delivery._id
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

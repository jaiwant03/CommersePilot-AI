const express = require('express');
const router = express.Router();
const { apiLimiter, authLimiter } = require('../middleware/rateLimiter');

// Routes imports
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const onboardingRoutes = require('./onboarding.routes');
const overviewRoutes = require('./overview.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const deliveryRoutes = require('./delivery.routes');
const inventoryRoutes = require('./inventory.routes');
const analyticsRoutes = require('./analytics.routes');
const assistantRoutes = require('./assistant.routes');
const automationRoutes = require('./automation.routes');
const settingsRoutes = require('./settings.routes');
const verificationRoutes = require('./verification.routes');
const webhookRoutes = require('./webhook.routes');

// Apply general rate limiter across API
router.use(apiLimiter);

// Mount routes (auth has dedicated strict limiter)
router.use('/health', healthRoutes);
router.use('/auth', authLimiter, authRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/overview', overviewRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/assistant', assistantRoutes);
router.use('/automations', automationRoutes);
router.use('/settings', settingsRoutes);
router.use('/verification', verificationRoutes);
router.use('/webhooks', webhookRoutes);

module.exports = router;

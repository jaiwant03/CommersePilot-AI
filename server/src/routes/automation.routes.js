const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automation.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', automationController.getAutomationLogs);
router.get('/status', automationController.getWorkflowStatuses);

// Manual trigger endpoints
router.post('/trigger/order-analysis/:orderId', automationController.triggerOrderAnalysis);
router.post('/trigger/inventory-analysis', automationController.triggerInventoryAnalysis);
router.post('/trigger/delivery-recovery/:deliveryId', automationController.triggerDeliveryRecovery);
router.post('/trigger/daily-report', automationController.triggerDailyReport);

module.exports = router;

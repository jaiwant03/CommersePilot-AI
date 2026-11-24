const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', deliveryController.getDeliveries);
router.get('/:id', deliveryController.getDeliveryById);
router.get('/:id/whatsapp-preview', deliveryController.getWhatsAppPreview);
router.post('/:id/whatsapp-reply', deliveryController.simulateWhatsAppReply);
router.post('/:id/simulate-event', deliveryController.simulateDeliveryEvent);
router.post('/:id/events', deliveryController.simulateDeliveryEvent);

module.exports = router;

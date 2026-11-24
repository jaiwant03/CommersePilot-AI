const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

// Public action endpoints accessed via email links
router.get('/token-info', verificationController.getTokenInfo);
router.post('/confirm-order', verificationController.confirmOrder);
router.post('/reschedule-delivery', verificationController.rescheduleDelivery);
router.post('/approve-po', verificationController.approvePo);

module.exports = router;

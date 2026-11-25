const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

// Order Verification Workflow Actions
router.post('/:id/approve', orderController.approveOrder);
router.post('/:id/request-confirmation', orderController.requestConfirmation);
router.post('/:id/flag-review', orderController.flagForReview);
router.post('/:id/mark-reviewed', orderController.markReviewed);
router.post('/:id/analyze-risk', orderController.analyzeOrderRisk);

module.exports = router;

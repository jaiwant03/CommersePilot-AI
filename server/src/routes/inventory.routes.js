const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', inventoryController.getInventoryOverview);
router.post('/adjust', inventoryController.adjustStock);
router.get('/movements', inventoryController.getMovements);
router.get('/forecast', inventoryController.getDemandForecast);

// Purchase Orders Management
router.get('/purchase-orders', inventoryController.getPurchaseOrders);
router.get('/purchase-orders/:id', inventoryController.getPurchaseOrderById);
router.post('/purchase-orders/:id/approve', inventoryController.approvePurchaseOrder);
router.put('/purchase-orders/:id', inventoryController.updatePurchaseOrder);
router.patch('/purchase-orders/:id', inventoryController.updatePurchaseOrder);
router.post('/purchase-orders/:id/reject', inventoryController.rejectPurchaseOrder);
router.post('/purchase-orders/:id/receive', inventoryController.receivePurchaseOrder);

module.exports = router;

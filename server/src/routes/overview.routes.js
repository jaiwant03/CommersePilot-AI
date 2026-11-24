const express = require('express');
const router = express.Router();
const overviewController = require('../controllers/overview.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', overviewController.getOverviewStats);
router.post('/seed-demo', overviewController.seedDemoData);

module.exports = router;

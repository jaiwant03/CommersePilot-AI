const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/import-data', settingsController.importStoreData);

module.exports = router;

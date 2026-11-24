const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistant.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/chat', assistantController.chatWithAssistant);

module.exports = router;

const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboarding.controller');
const { authenticate } = require('../middleware/auth');

// Protected Onboarding Routes
router.use(authenticate);

router.get('/', onboardingController.getOnboardingState);
router.post('/step', onboardingController.updateOnboardingStep);
router.post('/complete', onboardingController.completeOnboarding);

module.exports = router;

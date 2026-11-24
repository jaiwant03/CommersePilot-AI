const Store = require('../models/Store.model');
const User = require('../models/User.model');

/**
 * Get current store onboarding status & data
 */
const getOnboardingState = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'No store associated with this user.'
      });
    }

    return res.status(200).json({
      success: true,
      store,
      isOnboarded: req.user.isOnboarded
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save onboarding step progress
 */
const updateOnboardingStep = async (req, res, next) => {
  try {
    const { 
      step, 
      details, 
      category, 
      channel, 
      paymentMethods, 
      inventoryPreferences 
    } = req.body;

    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Step 2: Extended Business Details
    if (details) {
      store.details = {
        city: details.city || store.details?.city || '',
        state: details.state || store.details?.state || '',
        supportEmail: details.supportEmail || store.details?.supportEmail || '',
        supportPhone: details.supportPhone || store.details?.supportPhone || ''
      };
    }

    // Step 3: Business Category
    if (category) {
      store.category = category;
    }

    // Step 4: Primary Ecommerce Channel
    if (channel) {
      store.channel = channel;
    }

    // Step 5: Payment Methods
    if (paymentMethods && Array.isArray(paymentMethods)) {
      store.paymentMethods = paymentMethods;
    }

    // Step 6: Initial Inventory Preferences
    if (inventoryPreferences) {
      store.inventoryPreferences = {
        lowStockAlertThreshold: inventoryPreferences.lowStockAlertThreshold || 10,
        autoReorderEnabled: Boolean(inventoryPreferences.autoReorderEnabled),
        syncFrequency: inventoryPreferences.syncFrequency || 'realtime',
        restockAlertChannel: inventoryPreferences.restockAlertChannel || 'both'
      };
    }

    if (step && typeof step === 'number' && step >= 1 && step <= 7) {
      store.onboardingStep = step;
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: 'Onboarding step saved.',
      store
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Finalize onboarding setup
 */
const completeOnboarding = async (req, res, next) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    store.onboardingCompleted = true;
    store.onboardingStep = 7;
    await store.save();

    const user = await User.findById(req.user._id);
    user.isOnboarded = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully! Store is now ready.',
      store,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOnboardingState,
  updateOnboardingStep,
  completeOnboarding
};

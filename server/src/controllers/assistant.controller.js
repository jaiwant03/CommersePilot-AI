const aiAssistantService = require('../services/aiAssistantService');

/**
 * AI Store Operations Copilot powered by Groq & real store database grounding
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    let storeId = req.store?._id;
    if (!storeId) {
      const Store = require('../models/Store.model');
      const User = require('../models/User.model');
      let fallbackStore = await Store.findOne({ owner: req.user?._id }) || 
                          await Store.findOne({ name: 'Trendy Threads' }) || 
                          await Store.findOne({});
      if (fallbackStore) {
        storeId = fallbackStore._id;
        if (req.user) {
          req.user.store = fallbackStore;
          await User.findByIdAndUpdate(req.user._id, { store: fallbackStore._id });
        }
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'No store connected. Please connect your store database to use the AI Copilot.' 
        });
      }
    }

    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt message is required.' });
    }

    const result = await aiAssistantService.processQuery(storeId, prompt);

    return res.status(200).json({
      success: true,
      reply: result.reply,
      intent: result.intent,
      dateRange: result.dateRange,
      groundedData: result.groundedData,
      usedGroq: result.usedGroq,
      guardrails: result.guardrails,
      timestamp: result.timestamp
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant
};

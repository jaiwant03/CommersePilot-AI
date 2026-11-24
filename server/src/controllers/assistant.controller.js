const aiAssistantService = require('../services/aiAssistantService');

/**
 * AI Store Operations Copilot powered by Groq & real store database grounding
 */
const chatWithAssistant = async (req, res, next) => {
  try {
    const storeId = req.store._id;
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
      timestamp: result.timestamp
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAssistant
};

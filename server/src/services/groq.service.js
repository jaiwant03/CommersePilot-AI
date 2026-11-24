const Groq = require('groq-sdk');
const config = require('../config/env');

let groqClient = null;

if (config.groqApiKey) {
  try {
    groqClient = new Groq({ apiKey: config.groqApiKey });
  } catch (err) {
    console.warn(`⚠️ Failed to initialize Groq client: ${err.message}`);
  }
}

/**
 * Helper to call Groq AI models
 */
const generateGroqCompletion = async ({ prompt, systemPrompt, model = 'llama-3.3-70b-versatile' }) => {
  if (!groqClient) {
    throw new Error('Groq API Key is not configured in environment variables.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const completion = await groqClient.chat.completions.create({
    messages,
    model,
    temperature: 0.2
  });

  return completion.choices[0]?.message?.content || '';
};

module.exports = {
  groqClient,
  generateGroqCompletion
};

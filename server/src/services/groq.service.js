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
 * Available model candidate priority list for resilient fallback
 */
const DEFAULT_PRIMARY_MODEL = config.groqModel || 'qwen/qwen3.8-27b';
const FALLBACK_MODELS = [
  DEFAULT_PRIMARY_MODEL,
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile'
];

/**
 * Execute a completion with a timeout
 */
const withTimeout = (promise, ms = 8000, errorMsg = 'Groq API request timed out') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
};

/**
 * Call Groq Prompt Guard model to detect injection and jailbreak risk
 * Evaluates probability score (0.0 to 1.0)
 * @param {string} prompt
 * @returns {Promise<{ score: number, raw: string, isAttack: boolean }>}
 */
const evaluatePromptGuard = async (prompt) => {
  if (!groqClient) {
    return { score: 0.0, raw: '0.0', isAttack: false, skipped: true };
  }

  const guardModel = config.groqGuardModel || 'meta-llama/llama-prompt-guard-2-86m';

  try {
    const response = await withTimeout(
      groqClient.chat.completions.create({
        model: guardModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 20
      }),
      3500,
      'Prompt Guard check timed out'
    );

    const raw = response.choices[0]?.message?.content?.trim() || '0.0';
    const parsed = parseFloat(raw);
    const score = isNaN(parsed) ? 0.0 : Math.min(Math.max(parsed, 0.0), 1.0);

    return {
      score,
      raw,
      isAttack: score >= 0.70,
      model: guardModel,
      skipped: false
    };
  } catch (err) {
    // Non-blocking fallback: if prompt guard service encounters transient issue
    return {
      score: 0.0,
      raw: 'error',
      isAttack: false,
      skipped: true,
      error: err.message
    };
  }
};

/**
 * Robust Groq Completion with automatic model fallback cascade
 */
const generateGroqCompletion = async ({
  prompt,
  systemPrompt,
  model = DEFAULT_PRIMARY_MODEL,
  temperature = 0.2,
  max_tokens = 1024,
  returnMetadata = false
}) => {
  if (!groqClient) {
    throw new Error('Groq API Key is not configured in environment variables.');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Deduplicated candidate list starting with requested model
  const candidateModels = Array.from(new Set([model, ...FALLBACK_MODELS]));
  let lastError = null;

  for (const candidate of candidateModels) {
    try {
      const completion = await withTimeout(
        groqClient.chat.completions.create({
          messages,
          model: candidate,
          temperature,
          max_tokens
        }),
        8000,
        `Groq completion timed out for model ${candidate}`
      );

      const content = completion.choices[0]?.message?.content || '';
      if (content.trim()) {
        if (returnMetadata) {
          return {
            content,
            modelUsed: candidate
          };
        }
        return content;
      }
    } catch (err) {
      lastError = err;
      // If 404 model not found or rate limited, iterate to next fallback candidate
      continue;
    }
  }

  throw lastError || new Error('All Groq candidate models failed to return a valid completion.');
};

module.exports = {
  groqClient,
  generateGroqCompletion,
  evaluatePromptGuard,
  DEFAULT_PRIMARY_MODEL
};

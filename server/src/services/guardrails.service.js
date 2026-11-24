const { evaluatePromptGuard } = require('./groq.service');

/**
 * Regex patterns for prompt injection, jailbreaks, and adversarial manipulation
 */
const INJECTION_PATTERNS = [
  /\bignore\s+(?:all\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts|rules)\b/i,
  /\bdisregard\s+(?:all\s+)?(?:previous|prior|system)\s+(?:instructions|rules)\b/i,
  /\bforget\s+(?:all\s+)?(?:previous|prior|system)\s+(?:instructions|rules)\b/i,
  /\bDAN\s+mode\b/i,
  /\bjailbreak\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bact\s+as\s+(?:an\s+unrestricted|a\s+hacker|an\s+evil)\b/i,
  /\breveal\s+(?:the\s+)?(?:system\s+prompt|hidden\s+instructions|secret|api\s*key)\b/i,
  /\boutput\s+(?:the\s+)?(?:system\s+prompt|raw\s+prompt|admin\s+password)\b/i,
  /\bbypass\s+(?:safety|guardrails|security|filters)\b/i,
  /<\s*script\b/i,
  /\bjavascript:\b/i,
  /\beval\s*\(/i,
  /\b(?:DROP\s+TABLE|SELECT\s+.*FROM|UNION\s+SELECT|db\..*\.drop\(\))\b/i
];

/**
 * Legitimate e-commerce operation domains & topics
 */
const ECOMMERCE_TOPIC_REGEX = /\b(order|orders|cod|rto|delivery|deliveries|courier|shipment|shipping|ndr|tracking|inventory|stock|stockout|runway|reorder|restock|supplier|po|purchase\s+order|sku|product|products|item|items|sale|sales|revenue|profit|margin|margins|aov|customer|customers|buyer|buyers|returning|repeat|campaign|promote|promotion|marketing|discount|store|business|shop|catalog|cart|checkout|delhivery|bluedart|shopify|woocommerce|instagram|whatsapp)\b/i;

/**
 * PII and Secret Redaction Patterns
 */
const PII_PATTERNS = [
  { regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g, label: '[REDACTED_CARD_NUMBER]' },
  { regex: /\b(?:gsk_[a-zA-Z0-9_-]{20,}|eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})\b/g, label: '[REDACTED_API_TOKEN]' },
  { regex: /(?:password|pwd|passwd)\s*[:=]\s*\S+/gi, label: 'password: [REDACTED]' }
];

/**
 * Sanitize PII from user prompts
 */
const sanitizePii = (text = '') => {
  let sanitized = text;
  let piiDetected = false;

  for (const { regex, label } of PII_PATTERNS) {
    if (regex.test(sanitized)) {
      piiDetected = true;
      sanitized = sanitized.replace(regex, label);
    }
  }

  return { sanitized, piiDetected };
};

/**
 * Layer 1: Evaluate Input Guardrails before LLM execution
 * @param {string} rawPrompt
 * @returns {Promise<{
 *   passed: boolean,
 *   sanitizedPrompt: string,
 *   threatScore: number,
 *   flags: string[],
 *   scopeApproved: boolean,
 *   rejectionResponse: string|null,
 *   guardrailModel: string
 * }>}
 */
const evaluateInputGuardrails = async (rawPrompt = '') => {
  const flags = [];
  let threatScore = 0.0;
  let guardrailModel = 'meta-llama/llama-prompt-guard-2-86m';

  // 1. Length & Buffer check
  const trimmed = (rawPrompt || '').trim();
  if (!trimmed) {
    return {
      passed: false,
      sanitizedPrompt: '',
      threatScore: 0.0,
      flags: ['EMPTY_PROMPT'],
      scopeApproved: false,
      rejectionResponse: 'Please ask a question regarding your store operations, orders, or inventory.',
      guardrailModel
    };
  }

  if (trimmed.length > 2000) {
    flags.push('LENGTH_LIMIT_EXCEEDED');
  }
  const promptToScreen = trimmed.slice(0, 1500);

  // 2. PII Sanitization
  const { sanitized: sanitizedPrompt, piiDetected } = sanitizePii(promptToScreen);
  if (piiDetected) {
    flags.push('PII_REDACTED');
  }

  // 3. Deterministic Regex Threat Screen (Zero latency fail-safe)
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitizedPrompt)) {
      flags.push('REGEX_INJECTION_DETECTED');
      threatScore = 0.99;
      break;
    }
  }

  // 4. Groq Prompt Guard Model Evaluation
  if (!flags.includes('REGEX_INJECTION_DETECTED')) {
    try {
      const guardRes = await evaluatePromptGuard(sanitizedPrompt);
      if (guardRes.model) guardrailModel = guardRes.model;
      threatScore = guardRes.score;

      if (guardRes.isAttack || threatScore >= 0.70) {
        flags.push('PROMPT_GUARD_HIGH_THREAT');
      }
    } catch (err) {
      // Non-blocking failover
      flags.push('PROMPT_GUARD_OFFLINE');
    }
  }

  // If injection detected, reject immediately
  if (flags.includes('REGEX_INJECTION_DETECTED') || flags.includes('PROMPT_GUARD_HIGH_THREAT')) {
    return {
      passed: false,
      sanitizedPrompt,
      threatScore,
      flags,
      scopeApproved: false,
      rejectionResponse: '🛡️ **Security Guardrail Triggered**: Your request was flagged as a potential prompt injection or system policy override attempt. CommercePilot AI strictly adheres to data integrity guardrails and answers only authorized store operations queries.',
      guardrailModel
    };
  }

  // 5. Scope & Domain Relevance Evaluation
  const isEcommerceRelevant = ECOMMERCE_TOPIC_REGEX.test(sanitizedPrompt);
  // Allow short greetings or queries if length < 30 chars
  const isGreeting = /^(hi|hello|hey|help|what can you do|good morning|namaste)\b/i.test(sanitizedPrompt);
  const scopeApproved = isEcommerceRelevant || isGreeting;

  if (!scopeApproved && sanitizedPrompt.length > 25) {
    flags.push('OUT_OF_SCOPE');
    return {
      passed: false,
      sanitizedPrompt,
      threatScore,
      flags,
      scopeApproved: false,
      rejectionResponse: '🛡️ **Domain Scope Notice**: I am your CommercePilot AI Operations Copilot, specialized exclusively in Indian D2C commerce, inventory runway forecasting, COD verification, and delivery performance. Please ask a question related to your store orders, stock levels, or business metrics.',
      guardrailModel
    };
  }

  return {
    passed: true,
    sanitizedPrompt,
    threatScore,
    flags,
    scopeApproved: true,
    rejectionResponse: null,
    guardrailModel
  };
};

/**
 * Layer 3: Evaluate Output Guardrails after LLM generation
 * @param {string} rawOutput
 * @param {object} groundedData
 * @returns {{
 *   passed: boolean,
 *   verifiedOutput: string,
 *   groundingScore: number,
 *   leaksFiltered: boolean
 * }}
 */
const evaluateOutputGuardrails = (rawOutput = '', groundedData = {}) => {
  let verifiedOutput = rawOutput;
  let leaksFiltered = false;

  // 1. Prevent secret leakage in output
  const sensitiveLeakPatterns = [
    /gsk_[a-zA-Z0-9_-]{10,}/gi,
    /jwt_secret[a-zA-Z0-9_-]*/gi,
    /mongodb:\/\/[^\s]+/gi
  ];

  for (const leakRegex of sensitiveLeakPatterns) {
    if (leakRegex.test(verifiedOutput)) {
      leaksFiltered = true;
      verifiedOutput = verifiedOutput.replace(leakRegex, '[CONFIDENTIAL_TOKEN_SUPPRESSED]');
    }
  }

  // 2. Fact Grounding Heuristic: ensure rupee figures or SKUs mentioned exist in telemetry
  let groundedChecks = 0;
  let groundedPasses = 0;

  const dataStr = JSON.stringify(groundedData);

  // Check currency figures
  const currencyMatches = verifiedOutput.match(/₹[\d,]+(?:\.\d+)?/g) || [];
  for (const match of currencyMatches) {
    groundedChecks++;
    const numClean = match.replace(/[₹,]/g, '');
    if (dataStr.includes(numClean)) {
      groundedPasses++;
    }
  }

  // Check SKUs (e.g. TT-...)
  const skuMatches = verifiedOutput.match(/\b[A-Z0-9]{2,4}-[A-Z0-9-]{3,10}\b/g) || [];
  for (const sku of skuMatches) {
    groundedChecks++;
    if (dataStr.includes(sku)) {
      groundedPasses++;
    }
  }

  const groundingScore = groundedChecks > 0 ? Number((groundedPasses / groundedChecks).toFixed(2)) : 1.0;

  // 3. Operational Guidance Disclaimer
  const disclaimerText = '\n\n*Grounded in verified store telemetry. Operational recommendations provided as guidance.*';
  if (!verifiedOutput.includes('telemetry') && !verifiedOutput.includes('guidance')) {
    verifiedOutput += disclaimerText;
  }

  return {
    passed: true,
    verifiedOutput,
    groundingScore,
    leaksFiltered
  };
};

module.exports = {
  evaluateInputGuardrails,
  evaluateOutputGuardrails,
  sanitizePii,
  INJECTION_PATTERNS
};

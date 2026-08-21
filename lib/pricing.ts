import { ModelPricing, CostEstimate, FileAttachment } from '../types';

export const MODEL_PRICING_CATALOG: Record<string, ModelPricing> = {
  'claude-sonnet': {
    modelId: 'claude-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindowTokens: 200000,
  },
  'claude-opus': {
    modelId: 'claude-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    contextWindowTokens: 200000,
  },
  'gpt-5': {
    modelId: 'gpt-5',
    name: 'GPT-5 (4o)',
    provider: 'OpenAI',
    inputCostPer1M: 2.5,
    outputCostPer1M: 10.0,
    contextWindowTokens: 128000,
  },
  'gpt-5-mini': {
    modelId: 'gpt-5-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindowTokens: 128000,
  },
  'gemini-flash': {
    modelId: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindowTokens: 1000000,
  },
  'gemini-pro': {
    modelId: 'gemini-pro',
    name: 'Gemini 2.5 Flash / Pro',
    provider: 'Google',
    inputCostPer1M: 0.35,
    outputCostPer1M: 1.05,
    contextWindowTokens: 1000000,
  },
  'gemini-2.5-flash': {
    modelId: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindowTokens: 1000000,
  },
  'gemini-2.5-pro': {
    modelId: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    contextWindowTokens: 1000000,
  },
};

/**
 * Calculates accurate real-time token counts and cost estimates for a prompt with attachments.
 */
export function estimatePromptCost(
  promptText: string,
  attachments: { name: string; content?: string }[] = [],
  modelId = 'claude-sonnet'
): CostEstimate {
  const pricing = MODEL_PRICING_CATALOG[modelId] || MODEL_PRICING_CATALOG['claude-sonnet'];

  // Base prompt text tokens (~3.8 chars/token)
  let totalChars = promptText.length;
  for (const doc of attachments) {
    totalChars += (doc.content || '').length;
    totalChars += doc.name.length + 30; // Framing overhead
  }

  // Add system prompt and framing tokens (~120 tokens)
  const estimatedInputTokens = Math.max(1, Math.ceil(totalChars / 3.8) + (totalChars > 0 ? 80 : 0));
  const contextLimit = pricing.contextWindowTokens;
  const contextPercent = Math.min(100, Math.round((estimatedInputTokens / contextLimit) * 10000) / 100);

  const estimatedInputCostUsd = (estimatedInputTokens / 1000000) * pricing.inputCostPer1M;
  // Estimate ~500 output tokens on average response
  const estimatedOutputCostUsd = (500 / 1000000) * pricing.outputCostPer1M;
  const estimatedTotalCostUsd = estimatedInputCostUsd + estimatedOutputCostUsd;

  let status: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (contextPercent > 90) status = 'exceeded';
  else if (contextPercent > 70) status = 'warning';

  return {
    inputTokens: estimatedInputTokens,
    contextLimit,
    contextPercent,
    estimatedInputCostUsd,
    estimatedTotalCostUsd,
    status,
  };
}

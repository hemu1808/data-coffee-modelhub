import { AIModel } from '../../types';

export const MOCK_MODELS: AIModel[] = [
  { id: 'claude-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', color: '#D97757', desc: 'Fast, balanced everyday model' },
  { id: 'claude-opus',   name: 'Claude Opus',   provider: 'Anthropic', color: '#D97757', desc: 'Deepest reasoning and analysis' },
  { id: 'gpt-5',         name: 'GPT-5',         provider: 'OpenAI',    color: '#74AA9C', desc: 'General purpose flagship' },
  { id: 'gpt-5-mini',    name: 'GPT-5 mini',    provider: 'OpenAI',    color: '#74AA9C', desc: 'Quick and lightweight' },
  { id: 'gemini-pro',    name: 'Gemini Pro',    provider: 'Google',    color: '#6E8EF7', desc: 'Strong multimodal model' },
  { id: 'gemini-flash',  name: 'Gemini Flash',  provider: 'Google',    color: '#6E8EF7', desc: 'Lowest latency option' },
];

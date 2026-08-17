export type AppView = 'chat' | 'billing' | 'collabs' | 'team-chats' | 'arena';

export type ProviderName = 'Anthropic' | 'OpenAI' | 'Google';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  avatar: string;
  creditsRemaining: number;
  tokensUsed: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: ProviderName;
  color: string;
  desc: string;
}

export interface FileAttachment {
  name: string;
  size?: string;
  type?: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  files?: string[];
  attachments?: FileAttachment[];
  createdAt?: string;
}

export interface Chat {
  id: string;
  title: string;
  model: string;
  pinned: boolean;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  workspaceId?: string;
  isTemporary?: boolean;
}

export interface WorkspaceMember {
  initials: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  color: string;
}

export interface WorkspaceDoc {
  name: string;
  info: string;
  uploadedBy: string;
  content?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  tokens: number;
  credits: number;
  members: WorkspaceMember[];
  documents: WorkspaceDoc[];
  chats: Chat[];
}

export interface UsageRecord {
  id?: string;
  date: string;
  model: string;
  provider: ProviderName;
  inputTokens: number;
  outputTokens: number;
  credits: number;
  status: 'Completed' | 'Failed' | 'Pending';
}

export interface RechargeRecord {
  date: string;
  id: string;
  method: string;
  credits: number;
  amount: string;
  status: 'Successful' | 'Pending' | 'Failed';
}

export type HistoryType = 'usage' | 'recharge';

export interface UserApiKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
}

export interface ArenaEntry {
  id: string;
  modelId: string;
  status: 'idle' | 'streaming' | 'completed' | 'error';
  content: string;
  ttftMs?: number;
  totalTimeMs?: number;
  tokenCount?: number;
  cost?: number;
  error?: string;
}

/* ─── API Types ─── */

export interface ChatRequest {
  prompt: string;
  model: string;
  chatId?: string;
  files?: string[];
  attachments?: FileAttachment[];
  apiKeys?: UserApiKeys;
  history?: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  model: string;
  content: string;
  tokensUsed?: number;
  creditsCost?: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

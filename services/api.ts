import { ChatRequest, ChatResponse, UsageRecord, RechargeRecord, Chat, User, Workspace, AIModel } from '../types';
import { MOCK_MODELS, MOCK_USER, MOCK_CHATS, MOCK_WORKSPACES, MOCK_USAGE_HISTORY, MOCK_RECHARGE_HISTORY } from '../data/mock';

/**
 * API Service Layer
 * Centralizes all data access, AI streaming, and mutation requests.
 */

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/* ─── Models ─── */

export async function fetchModels(): Promise<AIModel[]> {
  await delay(50);
  return MOCK_MODELS;
}

export function getModelsSync(): AIModel[] {
  return MOCK_MODELS;
}

/* ─── Auth / User ─── */

export async function fetchCurrentUser(): Promise<User> {
  await delay(100);
  return MOCK_USER;
}

/* ─── Chats ─── */

export async function fetchChats(): Promise<Chat[]> {
  await delay(50);
  return MOCK_CHATS;
}

export async function createChat(chat: Chat): Promise<Chat> {
  await delay(50);
  return chat;
}

export async function deleteChat(chatId: string): Promise<void> {
  await delay(50);
}

/**
 * Streams chat responses chunk-by-chunk with TTFT calculation and real-time callback.
 */
export async function streamChatMessage(
  request: ChatRequest,
  onChunk: (accumulatedText: string, latestChunk: string) => void
): Promise<{ id: string; content: string; ttftMs: number; totalTimeMs: number }> {
  const startTime = performance.now();
  let firstTokenReceived = false;
  let ttftMs = 0;
  let accumulated = '';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Chat API failed with status ${res.status}`);
  }

  if (!res.body) {
    throw new Error('Readable stream not supported on response.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    if (!firstTokenReceived) {
      firstTokenReceived = true;
      ttftMs = Math.round(performance.now() - startTime);
    }

    const chunk = decoder.decode(value, { stream: true });
    accumulated += chunk;
    onChunk(accumulated, chunk);
  }

  const totalTimeMs = Math.round(performance.now() - startTime);
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return {
    id: msgId,
    content: accumulated,
    ttftMs: ttftMs || totalTimeMs,
    totalTimeMs,
  };
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  const text = await res.text();
  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    model: request.model,
    content: text,
  };
}

/* ─── Workspaces ─── */

export async function fetchWorkspaces(): Promise<Workspace[]> {
  await delay(50);
  return MOCK_WORKSPACES;
}

/* ─── Billing ─── */

export async function fetchUsageHistory(): Promise<UsageRecord[]> {
  await delay(100);
  return MOCK_USAGE_HISTORY;
}

export async function fetchRechargeHistory(): Promise<RechargeRecord[]> {
  await delay(100);
  return MOCK_RECHARGE_HISTORY;
}

export async function rechargeCredits(amount: number): Promise<RechargeRecord> {
  await delay(200);
  return {
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    id: `RC-${Date.now().toString(36).toUpperCase()}`,
    method: 'Credit Recharge',
    credits: amount,
    amount: `$${amount.toFixed(2)}`,
    status: 'Successful',
  };
}

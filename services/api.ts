import { ChatRequest, ChatResponse, UsageRecord, RechargeRecord, Chat, User, Workspace, AIModel } from '../types';
import { MOCK_MODELS, MOCK_USER, MOCK_CHATS, MOCK_WORKSPACES, MOCK_USAGE_HISTORY, MOCK_RECHARGE_HISTORY } from '../data/mock';

/**
 * API Service Layer
 * 
 * All data access goes through this module. Currently returns mock data.
 * When integrating a real backend, replace the implementations here.
 * The rest of the app remains unchanged.
 */

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/* ─── Models ─── */

export async function fetchModels(): Promise<AIModel[]> {
  await delay(100);
  return MOCK_MODELS;
}

export function getModelsSync(): AIModel[] {
  return MOCK_MODELS;
}

/* ─── Auth / User ─── */

export async function fetchCurrentUser(): Promise<User> {
  await delay(150);
  return MOCK_USER;
}

/* ─── Chats ─── */

export async function fetchChats(): Promise<Chat[]> {
  await delay(100);
  return MOCK_CHATS;
}

export async function createChat(chat: Chat): Promise<Chat> {
  await delay(150);
  return chat;
}

export async function deleteChat(chatId: string): Promise<void> {
  await delay(100);
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
  return res.json();
}

/* ─── Workspaces ─── */

export async function fetchWorkspaces(): Promise<Workspace[]> {
  await delay(100);
  return MOCK_WORKSPACES;
}

/* ─── Billing ─── */

export async function fetchUsageHistory(): Promise<UsageRecord[]> {
  await delay(200);
  return MOCK_USAGE_HISTORY;
}

export async function fetchRechargeHistory(): Promise<RechargeRecord[]> {
  await delay(200);
  return MOCK_RECHARGE_HISTORY;
}

export async function rechargeCredits(amount: number): Promise<RechargeRecord> {
  await delay(300);
  return {
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    id: `RC-${Date.now().toString(36).toUpperCase()}`,
    method: 'Demo payment',
    credits: amount,
    amount: `$${amount.toFixed(2)}`,
    status: 'Successful',
  };
}

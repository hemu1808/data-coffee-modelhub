'use client';

import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { useChatStore } from '../store/useChatStore';
import { useUIStore } from '../store/useUIStore';
import { useUserStore } from '../store/useUserStore';
import { sendMessage } from '../services/api';
import { MOCK_MODELS } from '../data/mock';

export function useChatCore() {
  const { currentChatId, chats, pendingFiles, addChat, addMessageToChat, clearPendingFiles } = useChatStore();
  const { selectedModelId } = useUIStore();
  const { deductUsage } = useUserStore();

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const currentModel = MOCK_MODELS.find((m) => m.id === selectedModelId) || MOCK_MODELS[0];
  const currentChat = chats.find((c) => c.id === currentChatId) || null;
  const messages = currentChat?.messages || [];

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed && pendingFiles.length === 0) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      files: pendingFiles.length > 0 ? [...pendingFiles] : undefined,
      createdAt: new Date().toISOString(),
    };

    let targetChatId = currentChatId;

    if (!targetChatId) {
      const newId = `chat_${Date.now()}`;
      const newChat = {
        id: newId,
        title: trimmed.slice(0, 45) || 'New chat',
        model: selectedModelId,
        pinned: false,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      addChat(newChat);
      targetChatId = newId;
    }

    addMessageToChat(targetChatId, userMsg);
    setInput('');
    clearPendingFiles();
    setIsStreaming(true);

    deductUsage(trimmed, 1.2);

    try {
      const res = await sendMessage({
        prompt: trimmed,
        model: selectedModelId,
        chatId: targetChatId,
      });

      const assistantMsg: ChatMessage = {
        id: res.id,
        role: 'assistant',
        model: selectedModelId,
        content: res.content,
        createdAt: new Date().toISOString(),
      };

      addMessageToChat(targetChatId, assistantMsg);
      deductUsage(res.content, 1.8);
    } catch {
      addMessageToChat(targetChatId, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        model: selectedModelId,
        content: '<p class=\"text-red-400\">Network error — please try again.</p>',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, currentChatId, selectedModelId, pendingFiles, addChat, addMessageToChat, clearPendingFiles, deductUsage]);

  return {
    input,
    setInput,
    isStreaming,
    currentModel,
    currentChat,
    messages,
    handleSend,
  };
}

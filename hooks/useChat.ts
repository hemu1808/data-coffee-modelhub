'use client';

import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { useChatStore } from '../store/useChatStore';
import { useUIStore } from '../store/useUIStore';
import { useUserStore } from '../store/useUserStore';
import { streamChatMessage } from '../services/api';
import { MOCK_MODELS } from '../data/mock';

export function useChatCore() {
  const {
    currentChatId,
    chats,
    pendingFiles,
    pendingAttachments,
    addChat,
    addMessageToChat,
    updateMessageContent,
    clearPendingFiles,
  } = useChatStore();
  const { selectedModelId } = useUIStore();
  const { deductUsage, apiKeys } = useUserStore();

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
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
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

    const assistantMsgId = `a_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      model: selectedModelId,
      content: '',
      createdAt: new Date().toISOString(),
    };

    addMessageToChat(targetChatId, initialAssistantMsg);

    try {
      const historyContext = (currentChat?.messages || []).slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChatMessage(
        {
          prompt: trimmed,
          model: selectedModelId,
          chatId: targetChatId,
          attachments: pendingAttachments,
          apiKeys,
          history: historyContext,
        },
        (accumulatedText) => {
          updateMessageContent(targetChatId!, assistantMsgId, accumulatedText);
        }
      );

      deductUsage('Completed AI Response', 1.8);
    } catch {
      updateMessageContent(
        targetChatId,
        assistantMsgId,
        '**Error**: Unable to reach AI inference service. Please check your network or API keys.'
      );
    } finally {
      setIsStreaming(false);
    }
  }, [
    input,
    currentChatId,
    selectedModelId,
    pendingFiles,
    pendingAttachments,
    currentChat,
    apiKeys,
    addChat,
    addMessageToChat,
    updateMessageContent,
    clearPendingFiles,
    deductUsage,
  ]);

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

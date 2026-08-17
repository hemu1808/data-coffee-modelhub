'use client';

import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { useUIStore } from '../store/useUIStore';
import { useUserStore } from '../store/useUserStore';
import { useChatStore } from '../store/useChatStore';
import { streamChatMessage } from '../services/api';
import { MOCK_MODELS } from '../data/mock';

/**
 * Isolated Temporary Chat Hook
 * Manages an ephemeral conversation in component memory only.
 */
export function useTempChat() {
  const { selectedModelId, setIsTempChatActive } = useUIStore();
  const { deductUsage, apiKeys } = useUserStore();
  const { addChat } = useChatStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const currentModel = MOCK_MODELS.find((m) => m.id === selectedModelId) || MOCK_MODELS[0];

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `temp_u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const assistantMsgId = `temp_a_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      model: selectedModelId,
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setInput('');
    setIsStreaming(true);

    deductUsage(trimmed, 1.2);

    try {
      const historyContext = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChatMessage(
        {
          prompt: trimmed,
          model: selectedModelId,
          apiKeys,
          history: historyContext,
        },
        (accumulatedText) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulatedText } : m))
          );
        }
      );

      deductUsage('Completed AI Response', 1.8);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: '**Error**: Inference connection interrupted. Please try again.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [input, selectedModelId, messages, apiKeys, deductUsage]);

  const saveToPermanentChats = useCallback(() => {
    if (messages.length === 0) return;

    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 45) : 'Saved Temporary Chat';

    const newChat = {
      id: `chat_${Date.now()}`,
      title,
      model: selectedModelId,
      pinned: false,
      messages: [...messages],
      createdAt: new Date().toISOString(),
    };

    addChat(newChat);
    setIsTempChatActive(false);
    setMessages([]);
  }, [messages, selectedModelId, addChat, setIsTempChatActive]);

  const discardTempChat = useCallback(() => {
    setMessages([]);
    setIsTempChatActive(false);
    setShowCloseDialog(false);
  }, [setIsTempChatActive]);

  return {
    messages,
    input,
    setInput,
    isStreaming,
    currentModel,
    showCloseDialog,
    setShowCloseDialog,
    handleSend,
    saveToPermanentChats,
    discardTempChat,
  };
}

'use client';

import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { useUIStore } from '../store/useUIStore';
import { useUserStore } from '../store/useUserStore';
import { useChatStore } from '../store/useChatStore';
import { sendMessage } from '../services/api';
import { MOCK_MODELS } from '../data/mock';

/**
 * Isolated Temporary Chat Hook
 * 
 * Manages an isolated conversation in component memory only.
 * Messages are NEVER stored in persistent stores or history unless explicitly "Saved to Chats".
 */
export function useTempChat() {
  const { selectedModelId, setIsTempChatActive } = useUIStore();
  const { deductUsage } = useUserStore();
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

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    deductUsage(trimmed, 1.2);

    try {
      const res = await sendMessage({
        prompt: trimmed,
        model: selectedModelId,
      });

      const assistantMsg: ChatMessage = {
        id: `temp_a_${Date.now()}`,
        role: 'assistant',
        model: selectedModelId,
        content: res.content,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      deductUsage(res.content, 1.8);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `temp_err_${Date.now()}`,
          role: 'assistant',
          model: selectedModelId,
          content: '<p class="text-red-400">Network error — please try again.</p>',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, selectedModelId, deductUsage]);

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

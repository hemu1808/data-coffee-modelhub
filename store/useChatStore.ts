import { create } from 'zustand';
import { Chat, ChatMessage, FileAttachment } from '../types';
import { MOCK_CHATS } from '../data/mock';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  pendingFiles: string[];
  pendingAttachments: FileAttachment[];

  setCurrentChatId: (id: string | null) => void;
  addChat: (chat: Chat) => void;
  deleteChat: (id: string) => void;
  togglePinChat: (id: string) => void;
  addMessageToChat: (chatId: string, message: ChatMessage) => void;
  updateMessageContent: (chatId: string, messageId: string, content: string) => void;
  addPendingFile: (filename: string, attachment?: FileAttachment) => void;
  removePendingFile: (filename: string) => void;
  clearPendingFiles: () => void;
  createNewChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: MOCK_CHATS,
  currentChatId: 'chat_1',
  pendingFiles: [],
  pendingAttachments: [],

  setCurrentChatId: (id) => set({ currentChatId: id }),

  addChat: (newChat) =>
    set((state) => ({
      chats: [newChat, ...state.chats],
      currentChatId: newChat.id,
    })),

  deleteChat: (id) =>
    set((state) => {
      const remaining = state.chats.filter((c) => c.id !== id);
      const nextCurrentId = state.currentChatId === id ? (remaining[0]?.id || null) : state.currentChatId;
      return { chats: remaining, currentChatId: nextCurrentId };
    }),

  togglePinChat: (id) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)),
    })),

  addMessageToChat: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              model: message.model || c.model,
              messages: [...c.messages, message],
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  updateMessageContent: (chatId, messageId, content) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, content } : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  addPendingFile: (filename, attachment) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.includes(filename) ? state.pendingFiles : [...state.pendingFiles, filename],
      pendingAttachments: attachment
        ? [...state.pendingAttachments.filter((a) => a.name !== filename), attachment]
        : state.pendingAttachments,
    })),

  removePendingFile: (filename) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.filter((f) => f !== filename),
      pendingAttachments: state.pendingAttachments.filter((a) => a.name !== filename),
    })),

  clearPendingFiles: () => set({ pendingFiles: [], pendingAttachments: [] }),

  createNewChat: () =>
    set({
      currentChatId: null,
      pendingFiles: [],
      pendingAttachments: [],
    }),
}));

import { create } from 'zustand';
import { Chat, ChatMessage, FileAttachment, MessageVersion, SemanticCitation } from '../types';
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
  updateMessageContent: (chatId: string, messageId: string, content: string, citations?: SemanticCitation[]) => void;
  
  // Message Branching & History Actions
  editUserMessageAndBranch: (chatId: string, messageId: string, newContent: string) => void;
  switchMessageVersion: (chatId: string, messageId: string, targetVersionIndex: number) => void;
  createAssistantVersion: (chatId: string, messageId: string, newContent: string, citations?: SemanticCitation[]) => void;
  forkChatFromMessage: (chatId: string, messageId: string) => string | null;

  addPendingFile: (filename: string, attachment?: FileAttachment) => void;
  removePendingFile: (filename: string) => void;
  clearPendingFiles: () => void;
  createNewChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
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

  updateMessageContent: (chatId, messageId, content, citations) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== messageId) return m;

                const currentVersions = m.versions || [
                  {
                    id: `${m.id}_v0`,
                    content: m.content,
                    model: m.model,
                    createdAt: m.createdAt || new Date().toISOString(),
                    citations: m.citations,
                  },
                ];

                const activeIdx = m.versionIndex !== undefined ? m.versionIndex : currentVersions.length - 1;
                const updatedVersions = [...currentVersions];
                if (updatedVersions[activeIdx]) {
                  updatedVersions[activeIdx] = {
                    ...updatedVersions[activeIdx],
                    content,
                    citations: citations || updatedVersions[activeIdx].citations,
                  };
                }

                return {
                  ...m,
                  content,
                  citations: citations || m.citations,
                  versions: updatedVersions,
                  versionIndex: activeIdx,
                };
              }),
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    })),

  editUserMessageAndBranch: (chatId, messageId, newContent) =>
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id !== chatId) return c;

        const updatedMessages = c.messages.map((m) => {
          if (m.id !== messageId) return m;

          const existingVersions: MessageVersion[] = m.versions && m.versions.length > 0
            ? m.versions
            : [
                {
                  id: `${m.id}_v0`,
                  content: m.content,
                  model: m.model,
                  createdAt: m.createdAt || new Date().toISOString(),
                  files: m.files,
                  attachments: m.attachments,
                },
              ];

          const newVersion: MessageVersion = {
            id: `${m.id}_v${existingVersions.length}`,
            content: newContent,
            model: m.model,
            createdAt: new Date().toISOString(),
            files: m.files,
            attachments: m.attachments,
          };

          const allVersions = [...existingVersions, newVersion];

          return {
            ...m,
            content: newContent,
            versions: allVersions,
            versionIndex: allVersions.length - 1,
          };
        });

        return {
          ...c,
          messages: updatedMessages,
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  switchMessageVersion: (chatId, messageId, targetVersionIndex) =>
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id !== chatId) return c;

        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId || !m.versions || !m.versions[targetVersionIndex]) return m;
            const target = m.versions[targetVersionIndex];
            return {
              ...m,
              content: target.content,
              citations: target.citations,
              versionIndex: targetVersionIndex,
            };
          }),
        };
      }),
    })),

  createAssistantVersion: (chatId, messageId, newContent, citations) =>
    set((state) => ({
      chats: state.chats.map((c) => {
        if (c.id !== chatId) return c;

        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId) return m;

            const existingVersions: MessageVersion[] = m.versions && m.versions.length > 0
              ? m.versions
              : [
                  {
                    id: `${m.id}_v0`,
                    content: m.content,
                    model: m.model,
                    createdAt: m.createdAt || new Date().toISOString(),
                    citations: m.citations,
                  },
                ];

            const newVersion: MessageVersion = {
              id: `${m.id}_v${existingVersions.length}`,
              content: newContent,
              model: m.model,
              createdAt: new Date().toISOString(),
              citations,
            };

            const allVersions = [...existingVersions, newVersion];

            return {
              ...m,
              content: newContent,
              citations,
              versions: allVersions,
              versionIndex: allVersions.length - 1,
            };
          }),
        };
      }),
    })),

  forkChatFromMessage: (chatId, messageId) => {
    const state = get();
    const sourceChat = state.chats.find((c) => c.id === chatId);
    if (!sourceChat) return null;

    const targetIdx = sourceChat.messages.findIndex((m) => m.id === messageId);
    if (targetIdx === -1) return null;

    // Slice messages up to the selected fork point
    const slicedMessages = sourceChat.messages.slice(0, targetIdx + 1).map((m) => ({
      ...m,
      id: `forked_${Date.now()}_${m.id}`,
    }));

    const forkedChatId = `chat_fork_${Date.now()}`;
    const forkedChat: Chat = {
      id: forkedChatId,
      title: `[Branch] ${sourceChat.title.replace(/^\[Branch\]\s*/, '')}`,
      model: sourceChat.model,
      pinned: false,
      messages: slicedMessages,
      createdAt: new Date().toISOString(),
      forkedFromChatId: chatId,
    };

    set({
      chats: [forkedChat, ...state.chats],
      currentChatId: forkedChatId,
    });

    return forkedChatId;
  },

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

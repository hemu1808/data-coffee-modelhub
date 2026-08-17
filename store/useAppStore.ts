import { useUIStore } from './useUIStore';
import { useUserStore } from './useUserStore';
import { useChatStore } from './useChatStore';
import { useWorkspaceStore } from './useWorkspaceStore';
import { MOCK_MODELS } from '../data/mock';

export { MOCK_MODELS as MODELS };

/**
 * Backward-compatible store hook facade combining domain stores.
 */
export function useAppStore<T>(selector?: (state: any) => T): T {
  const ui = useUIStore();
  const userState = useUserStore();
  const chatState = useChatStore();
  const workspaceState = useWorkspaceStore();

  const combined = {
    // UI Store
    sidebarOpen: ui.sidebarOpen,
    activeView: ui.activeView,
    selectedModelId: ui.selectedModelId,
    isTempChatActive: ui.isTempChatActive,
    setSidebarOpen: ui.setSidebarOpen,
    toggleSidebar: ui.toggleSidebar,
    setActiveView: ui.setActiveView,
    setSelectedModelId: ui.setSelectedModelId,
    setIsTempChatActive: ui.setIsTempChatActive,

    // User Store
    user: userState.user,
    requestCount: userState.requestCount,
    deductUsage: userState.deductUsage,
    rechargeCredits: userState.rechargeCredits,

    // Chat Store
    chats: chatState.chats,
    currentChatId: chatState.currentChatId,
    pendingFiles: chatState.pendingFiles,
    setCurrentChatId: (id: any) => {
      chatState.setCurrentChatId(id ? String(id) : null);
      ui.setActiveView('chat');
    },
    addChat: chatState.addChat,
    deleteChat: chatState.deleteChat,
    togglePinChat: (id: any) => chatState.togglePinChat(String(id)),
    addMessageToChat: (chatId: any, message: any) => chatState.addMessageToChat(String(chatId), message),
    addPendingFile: chatState.addPendingFile,
    removePendingFile: chatState.removePendingFile,
    clearPendingFiles: chatState.clearPendingFiles,
    createNewChat: () => {
      chatState.createNewChat();
      ui.setActiveView('chat');
    },

    // Workspace Store
    workspaces: workspaceState.workspaces,
    currentWorkspaceId: workspaceState.currentWorkspaceId,
    setCurrentWorkspaceId: workspaceState.setCurrentWorkspaceId,
    addTeamDocument: workspaceState.addTeamDocument,
  };

  return selector ? selector(combined) : (combined as any);
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppView } from '../types';

interface UIState {
  sidebarOpen: boolean;
  activeView: AppView;
  selectedModelId: string;
  isTempChatActive: boolean;

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveView: (view: AppView) => void;
  setSelectedModelId: (id: string) => void;
  setIsTempChatActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeView: 'chat',
      selectedModelId: 'claude-sonnet',
      isTempChatActive: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setActiveView: (view) => set({ activeView: view }),
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      setIsTempChatActive: (active) => set({ isTempChatActive: active }),
    }),
    {
      name: 'modelhub-ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        selectedModelId: state.selectedModelId,
      }),
    }
  )
);

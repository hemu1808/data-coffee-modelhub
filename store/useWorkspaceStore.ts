import { create } from 'zustand';
import { Workspace, WorkspaceDoc } from '../types';
import { MOCK_WORKSPACES } from '../data/mock';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string;

  setCurrentWorkspaceId: (id: string) => void;
  addTeamDocument: (workspaceId: string, doc: WorkspaceDoc) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: MOCK_WORKSPACES,
  currentWorkspaceId: 'product',

  setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),

  addTeamDocument: (workspaceId, doc) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId ? { ...w, documents: [doc, ...w.documents] } : w
      ),
    })),
}));

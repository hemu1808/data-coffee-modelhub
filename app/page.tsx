'use client';

import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatArea } from '../components/chat/ChatArea';
import { ModelArena } from '../components/arena/ModelArena';
import { UsageDashboard } from '../components/dashboard/UsageDashboard';
import { TeamSpace } from '../components/workspace/TeamSpace';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { CommandPalette } from '../components/ui/CommandPalette';
import { ApiKeyModal } from '../components/settings/ApiKeyModal';
import { AuthModal } from '../components/auth/AuthModal';
import { DocumentInspector } from '../components/document/DocumentInspector';

export default function Home() {
  const activeView = useUIStore((state) => state.activeView);

  return (
    <div className="flex h-screen overflow-hidden bg-hub-bg font-sans">
      <ErrorBoundary>
        <Sidebar />
      </ErrorBoundary>
      <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <ErrorBoundary>
          {activeView === 'chat' && <ChatArea />}
          {activeView === 'arena' && <ModelArena />}
          {activeView === 'billing' && <UsageDashboard />}
          {(activeView === 'collabs' || activeView === 'team-chats') && <TeamSpace />}
        </ErrorBoundary>
      </main>
      <CommandPalette />
      <ApiKeyModal />
      <AuthModal />
      <DocumentInspector />
    </div>
  );
}

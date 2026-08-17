'use client';

import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { SidebarIcon } from '../icons';

interface ChatHeaderProps {
  title: string;
  messageCount: number;
  isTemp?: boolean;
  children?: React.ReactNode;
}

export function ChatHeader({ title, messageCount, isTemp = false, children }: ChatHeaderProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="shrink-0 flex items-center justify-between gap-3 px-4 md:px-6 h-12 border-b border-hub-border bg-hub-bg/80 backdrop-blur-sm select-none">
      <div className="flex items-center gap-3 min-w-0">
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-hub-sm text-hub-text-muted hover:text-hub-text hover:bg-hub-hover transition-colors"
            title="Show sidebar"
            aria-label="Show sidebar"
          >
            <SidebarIcon size={16} />
          </button>
        )}

        <h2 className="text-hub-sm font-semibold truncate text-hub-text">{title}</h2>

        {isTemp && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
            🔒 Temporary Mode
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {messageCount > 0 && (
          <span className="text-hub-xs text-hub-text-muted hidden sm:inline">{messageCount} messages</span>
        )}
        {children}
      </div>
    </header>
  );
}

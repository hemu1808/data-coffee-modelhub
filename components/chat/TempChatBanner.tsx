'use client';

import React from 'react';
import { LockIcon, XIcon } from '../icons';

interface TempChatBannerProps {
  onClose: () => void;
}

export function TempChatBanner({ onClose }: TempChatBannerProps) {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 flex items-center justify-between text-hub-xs text-amber-400 animate-fade-in shrink-0">
      <div className="flex items-center gap-2 font-medium">
        <LockIcon size={14} className="text-amber-400 shrink-0" />
        <span>
          <strong>Isolated Temporary Chat:</strong> Messages are not saved to chat history or synced.
        </span>
      </div>
      <button
        onClick={onClose}
        className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors font-semibold"
      >
        Exit <XIcon size={12} />
      </button>
    </div>
  );
}

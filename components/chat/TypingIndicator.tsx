'use client';

import React from 'react';

interface TypingIndicatorProps {
  modelColor?: string;
  modelName?: string;
}

export function TypingIndicator({ modelColor = '#10A37F', modelName }: TypingIndicatorProps) {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[75%]">
        {modelName && (
          <div className="flex items-center gap-1.5 mb-1 text-hub-xs text-hub-text-muted">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: modelColor }} />
            <span>{modelName}</span>
          </div>
        )}
        <div className="rounded-hub-md px-4 py-3 bg-hub-panel border border-hub-border rounded-bl-sm">
          <span className="inline-flex items-center gap-1.5 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full animate-blink"
                style={{ backgroundColor: modelColor, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { SparkleIcon } from '../icons';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const QUICK_CARDS = [
  { q: 'Help me plan a product launch timeline', icon: '🚀' },
  { q: 'Summarize key points of a report', icon: '📊' },
  { q: 'Compare cloud storage pricing options', icon: '☁️' },
];

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-gradient-to-br from-hub-accent/30 to-hub-accent/5 border border-hub-accent/20 flex items-center justify-center text-hub-accent">
        <SparkleIcon size={24} />
      </div>
      <h1 className="text-hub-2xl font-bold mb-2 text-hub-text">Data Coffee Model Hub</h1>
      <p className="text-hub-text-muted text-hub-sm max-w-sm mx-auto mb-8 leading-relaxed">
        Enterprise multi-model AI workspace. Select a model and start a conversation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
        {QUICK_CARDS.map((card) => (
          <button
            key={card.q}
            onClick={() => onSelectPrompt(card.q)}
            className="flex flex-col items-start gap-2 rounded-hub-md bg-hub-panel border border-hub-border p-4 text-left text-hub-sm text-hub-text-sec hover:bg-hub-hover hover:border-hub-active transition-all duration-150 hover:-translate-y-0.5"
          >
            <span className="text-lg">{card.icon}</span>
            <span className="line-clamp-2 font-medium text-hub-text">{card.q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

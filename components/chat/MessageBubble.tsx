'use client';

import React, { useState, useCallback } from 'react';
import { ChatMessage, AIModel } from '../../types';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { CopyIcon, CheckIcon, DocIcon } from '../icons';
import { MOCK_MODELS } from '../../data/mock';

interface MessageBubbleProps {
  message: ChatMessage;
  model?: AIModel;
}

export function MessageBubble({ message, model }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const msgModel = model || (message.model ? MOCK_MODELS.find((m) => m.id === message.model) : undefined);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const rawText = message.content.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      <div className={`max-w-[85%] md:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Author Label */}
        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11.5px] text-hub-text-muted font-medium select-none">
          {!isUser && msgModel && (
            <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: msgModel.color }} />
          )}
          <span>{isUser ? 'You' : msgModel?.name || 'Assistant'}</span>
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-hub-sm leading-relaxed ${
            isUser
              ? 'bg-hub-accent text-white rounded-tr-sm shadow-sm'
              : 'bg-hub-panel border border-hub-border rounded-tl-sm shadow-hub-card w-full'
          }`}
        >
          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {message.files.map((file) => (
                <span
                  key={file}
                  className="inline-flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 text-[11px] font-medium"
                >
                  <DocIcon size={12} /> {file}
                </span>
              ))}
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.content ? (
            <MarkdownRenderer content={message.content} />
          ) : (
            <div className="flex items-center gap-1.5 py-1 px-0.5">
              <span className="w-2 h-2 rounded-full bg-hub-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-hub-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-hub-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {/* Copy / Actions Bar for Assistant */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-hub-hover text-hub-text-muted hover:text-hub-text transition-colors"
              title="Copy response"
              aria-label="Copy response"
            >
              {copied ? <CheckIcon size={13} className="text-hub-accent" /> : <CopyIcon size={13} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

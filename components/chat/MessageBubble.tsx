'use client';

import React, { useState, useCallback } from 'react';
import { ChatMessage, AIModel } from '../../types';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import {
  CopyIcon,
  CheckIcon,
  DocIcon,
  BranchIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshIcon,
} from '../icons';
import { MOCK_MODELS } from '../../data/mock';
import { useChatStore } from '../../store/useChatStore';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useToast } from '../ui/Toast';

interface MessageBubbleProps {
  message: ChatMessage;
  model?: AIModel;
  onEditRetry?: (messageId: string, newContent: string) => void;
  onRegenerate?: (messageId: string) => void;
}

export function MessageBubble({ message, model, onEditRetry, onRegenerate }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const msgModel = model || (message.model ? MOCK_MODELS.find((m) => m.id === message.model) : undefined);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const { currentChatId, switchMessageVersion, forkChatFromMessage } = useChatStore();
  const openInspector = useDocumentStore((state) => state.openInspector);
  const toast = useToast();

  const versions = message.versions || [];
  const hasMultipleVersions = versions.length > 1;
  const currentVersionIndex = message.versionIndex !== undefined ? message.versionIndex : versions.length > 0 ? versions.length - 1 : 0;

  const handleCopy = useCallback(() => {
    const rawText = message.content.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  const handleFork = useCallback(() => {
    if (!currentChatId) return;
    const forkedId = forkChatFromMessage(currentChatId, message.id);
    if (forkedId) {
      toast.success('Branched into a new dedicated chat thread!');
    }
  }, [currentChatId, message.id, forkChatFromMessage, toast]);

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false);
      return;
    }
    if (onEditRetry) {
      onEditRetry(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const handlePrevVersion = () => {
    if (!currentChatId || currentVersionIndex <= 0) return;
    switchMessageVersion(currentChatId, message.id, currentVersionIndex - 1);
  };

  const handleNextVersion = () => {
    if (!currentChatId || currentVersionIndex >= versions.length - 1) return;
    switchMessageVersion(currentChatId, message.id, currentVersionIndex + 1);
  };

  const handleOpenAttachment = (fileName: string) => {
    const docObj = (message.attachments || []).find((a) => a.name === fileName) || {
      name: fileName,
      size: 'Document',
      content: `[Attached Context: ${fileName}]\n\nLine 1: Attached document context snippet.\nLine 2: Ready for interactive vector inspection.\nLine 3: Semantic embeddings computed with text-embedding-3-small.`,
    };
    openInspector(docObj);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      <div className={`max-w-[85%] md:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Author Label & Version Pagination */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11.5px] text-hub-text-muted font-medium select-none">
          <div className="flex items-center gap-1.5">
            {!isUser && msgModel && (
              <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: msgModel.color }} />
            )}
            <span>{isUser ? 'You' : msgModel?.name || 'Assistant'}</span>
          </div>

          {/* Sibling Version Pagination < 1 / 3 > */}
          {hasMultipleVersions && (
            <div className="flex items-center gap-1 bg-hub-panel border border-hub-border rounded-full px-1.5 py-0.5 text-[10.5px] font-mono text-hub-text-sec">
              <button
                onClick={handlePrevVersion}
                disabled={currentVersionIndex === 0}
                className="hover:text-hub-text disabled:opacity-30 p-0.5 transition-colors"
                title="Previous version branch"
                aria-label="Previous version"
              >
                <ChevronLeftIcon size={11} />
              </button>
              <span>
                {currentVersionIndex + 1}/{versions.length}
              </span>
              <button
                onClick={handleNextVersion}
                disabled={currentVersionIndex === versions.length - 1}
                className="hover:text-hub-text disabled:opacity-30 p-0.5 transition-colors"
                title="Next version branch"
                aria-label="Next version"
              >
                <ChevronRightIcon size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Bubble or In-line Prompt Editor */}
        {isEditing ? (
          <div className="w-full bg-hub-panel border border-hub-accent/70 rounded-2xl p-3 shadow-lg flex flex-col gap-2.5">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full bg-transparent text-hub-sm text-hub-text outline-none resize-none leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-hub-border/60">
              <button
                onClick={() => {
                  setEditContent(message.content);
                  setIsEditing(false);
                }}
                className="px-3 py-1 text-xs text-hub-text-muted hover:text-hub-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3.5 py-1 rounded-lg bg-hub-accent hover:bg-hub-accent-hi text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Save & Retry
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-2xl px-4 py-3 text-hub-sm leading-relaxed ${
              isUser
                ? 'bg-hub-accent text-white rounded-tr-sm shadow-sm'
                : 'bg-hub-panel border border-hub-border rounded-tl-sm shadow-hub-card w-full'
            }`}
          >
            {/* File Attachments with 1-click Inspector preview */}
            {message.files && message.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {message.files.map((file) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => handleOpenAttachment(file)}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer border border-white/10"
                    title="Click to preview in Document Inspector"
                  >
                    <DocIcon size={12} /> {file}
                  </button>
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
        )}

        {/* Action Toolbar */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
            {/* User Edit & Retry Trigger */}
            {isUser && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-hub-hover text-hub-text-muted hover:text-hub-text transition-colors flex items-center gap-1 text-[11px]"
                title="Edit prompt & branch"
                aria-label="Edit prompt"
              >
                <PencilIcon size={12} />
              </button>
            )}

            {/* Fork to New Chat Button (available on both User & Assistant) */}
            <button
              onClick={handleFork}
              className="p-1 rounded hover:bg-hub-hover text-hub-text-muted hover:text-hub-accent-hi transition-colors flex items-center gap-1 text-[11px]"
              title="Branch to New Chat from this point"
              aria-label="Fork to new chat"
            >
              <BranchIcon size={12} />
            </button>

            {/* Assistant Actions: Regenerate & Copy */}
            {!isUser && message.content && (
              <>
                {onRegenerate && (
                  <button
                    onClick={() => onRegenerate(message.id)}
                    className="p-1 rounded hover:bg-hub-hover text-hub-text-muted hover:text-hub-text transition-colors"
                    title="Regenerate alternative response"
                    aria-label="Regenerate response"
                  >
                    <RefreshIcon size={12} />
                  </button>
                )}

                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-hub-hover text-hub-text-muted hover:text-hub-text transition-colors"
                  title="Copy response"
                  aria-label="Copy response"
                >
                  {copied ? <CheckIcon size={12} className="text-hub-accent" /> : <CopyIcon size={12} />}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

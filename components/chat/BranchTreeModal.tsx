'use client';

import React from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Dialog, DialogFooter } from '../ui/Dialog';
import { BranchTreeNode, ChatMessage } from '../../types';
import { BranchIcon, GitForkIcon, CheckIcon, SparkleIcon } from '../icons';

interface BranchTreeModalProps {
  open: boolean;
  onClose: () => void;
}

export function BranchTreeModal({ open, onClose }: BranchTreeModalProps) {
  const { chats, currentChatId, switchMessageVersion, forkChatFromMessage } = useChatStore();
  const currentChat = chats.find((c) => c.id === currentChatId);

  if (!currentChat) return null;

  // Build branch tree nodes from chat messages and their version arrays
  const nodes: BranchTreeNode[] = [];

  currentChat.messages.forEach((msg, msgIdx) => {
    const totalVersions = (msg.versions && msg.versions.length > 0) ? msg.versions.length : 1;
    const activeVersionIdx = msg.versionIndex || 0;

    if (msg.versions && msg.versions.length > 0) {
      msg.versions.forEach((ver, verIdx) => {
        nodes.push({
          id: `${msg.id}_v${verIdx}`,
          messageId: msg.id,
          role: msg.role,
          model: ver.model || msg.model,
          content: ver.content,
          snippet: ver.content.slice(0, 140) + (ver.content.length > 140 ? '…' : ''),
          timestamp: ver.createdAt || msg.createdAt || '',
          versionIndex: verIdx,
          totalVersions,
          isActive: verIdx === activeVersionIdx,
          parentId: msgIdx > 0 ? currentChat.messages[msgIdx - 1].id : null,
          children: [],
          depth: msgIdx,
        });
      });
    } else {
      nodes.push({
        id: `${msg.id}_v0`,
        messageId: msg.id,
        role: msg.role,
        model: msg.model,
        content: msg.content,
        snippet: msg.content.slice(0, 140) + (msg.content.length > 140 ? '…' : ''),
        timestamp: msg.createdAt || '',
        versionIndex: 0,
        totalVersions: 1,
        isActive: true,
        parentId: msgIdx > 0 ? currentChat.messages[msgIdx - 1].id : null,
        children: [],
        depth: msgIdx,
      });
    }
  });

  // Group nodes by step depth
  const depthGroups: Record<number, BranchTreeNode[]> = {};
  nodes.forEach((n) => {
    if (!depthGroups[n.depth]) depthGroups[n.depth] = [];
    depthGroups[n.depth].push(n);
  });

  const depths = Object.keys(depthGroups)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Conversation Branch Tree Visualizer"
      description={`Visual DAG of prompt edits, sibling versions, and alternate branches in "${currentChat.title}"`}
      maxWidth="max-w-3xl"
    >
      <div className="py-2 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
        {depths.length === 0 ? (
          <div className="text-center py-10 text-xs text-hub-text-muted">
            No messages in this chat yet. Type a message and use Edit & Retry to generate alternate branches!
          </div>
        ) : (
          <div className="relative pl-4 space-y-6 before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-hub-border">
            {depths.map((depth) => {
              const stepNodes = depthGroups[depth];
              return (
                <div key={depth} className="relative pl-6">
                  {/* Step depth indicator badge */}
                  <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-hub-panel border-2 border-hub-accent flex items-center justify-center text-[9px] font-bold text-hub-text z-10">
                    {depth + 1}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {stepNodes.map((node) => {
                      const isUser = node.role === 'user';
                      return (
                        <div
                          key={node.id}
                          className={`flex-1 rounded-xl border p-3 transition-all relative ${
                            node.isActive
                              ? 'bg-hub-panel border-hub-accent shadow-md shadow-hub-accent/10 ring-1 ring-hub-accent'
                              : 'bg-hub-bg/80 border-hub-border opacity-70 hover:opacity-100 hover:border-hub-text-muted'
                          }`}
                        >
                          {/* Node Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                  isUser
                                    ? 'bg-hub-accent/15 text-hub-accent-hi border border-hub-accent/30'
                                    : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                                }`}
                              >
                                {isUser ? 'User Prompt' : node.model || 'Assistant'}
                              </span>

                              {node.totalVersions > 1 && (
                                <span className="text-[10px] font-mono text-hub-text-muted px-1.5 py-0.2 rounded bg-black/40 border border-hub-border">
                                  v{node.versionIndex + 1}/{node.totalVersions}
                                </span>
                              )}
                            </div>

                            {node.isActive ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                <CheckIcon size={11} /> Active
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  if (currentChatId) {
                                    switchMessageVersion(currentChatId, node.messageId, node.versionIndex);
                                  }
                                }}
                                className="text-[10.5px] text-hub-accent hover:underline font-medium"
                              >
                                Switch to this branch
                              </button>
                            )}
                          </div>

                          {/* Node Snippet */}
                          <p className="text-xs text-hub-text leading-relaxed font-sans line-clamp-3">
                            {node.snippet}
                          </p>

                          {/* Node Actions */}
                          <div className="mt-3 pt-2 border-t border-hub-border/40 flex items-center justify-between text-[10.5px]">
                            <span className="text-hub-text-muted font-mono text-[10px]">
                              {node.timestamp ? new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                if (currentChatId) {
                                  forkChatFromMessage(currentChatId, node.messageId);
                                  onClose();
                                }
                              }}
                              className="inline-flex items-center gap-1 text-hub-text-muted hover:text-hub-text transition-colors"
                              title="Fork branch to new chat"
                            >
                              <GitForkIcon size={12} />
                              <span>Fork</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter>
        <button
          onClick={onClose}
          className="bg-hub-panel hover:bg-hub-hover text-hub-text border border-hub-border rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
        >
          Close Visualizer
        </button>
      </DialogFooter>
    </Dialog>
  );
}

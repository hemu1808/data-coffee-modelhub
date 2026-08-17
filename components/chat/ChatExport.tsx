'use client';

import React, { useState } from 'react';
import { ChatMessage } from '../../types';
import { ExportIcon, DownloadIcon, CheckIcon } from '../icons';
import { useToast } from '../ui/Toast';

interface ChatExportProps {
  chatTitle: string;
  messages: ChatMessage[];
}

export function ChatExport({ chatTitle, messages }: ChatExportProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const generateMarkdown = () => {
    let md = `# ${chatTitle}\n\n*Exported from Data Coffee Model Hub on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    messages.forEach((m) => {
      const sender = m.role === 'user' ? 'User' : m.model || 'Assistant';
      const cleanContent = m.content.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<br\s*\/?>/g, '\n');
      md += `### ${sender}\n${cleanContent}\n\n`;
    });
    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    toast.success('Chat copied to clipboard as Markdown');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chatTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded chat export');
  };

  if (messages.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleCopyMarkdown}
        className="p-1.5 rounded-hub-sm text-hub-text-muted hover:text-hub-text hover:bg-hub-hover transition-colors"
        title="Copy chat as Markdown"
        aria-label="Copy chat as Markdown"
      >
        {copied ? <CheckIcon size={14} className="text-hub-accent" /> : <ExportIcon size={14} />}
      </button>
      <button
        onClick={handleDownloadFile}
        className="p-1.5 rounded-hub-sm text-hub-text-muted hover:text-hub-text hover:bg-hub-hover transition-colors"
        title="Download .md file"
        aria-label="Download .md file"
      >
        <DownloadIcon size={14} />
      </button>
    </div>
  );
}

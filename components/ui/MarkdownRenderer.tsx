'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyIcon, CheckIcon } from '../icons';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function normalizeMarkdown(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim();
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const cleanContent = normalizeMarkdown(content);

  return (
    <div className={`prose-hub text-hub-text text-hub-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className: codeClass, children, ...props }: any) {
            const match = /language-(\w+)/.exec(codeClass || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (match || codeString.includes('\n'))) {
              return <CodeBlock language={language || 'text'} code={codeString} />;
            }

            return (
              <code
                className="bg-hub-bg/80 border border-hub-border/60 text-hub-accent-hi rounded-[5px] px-1.5 py-0.5 text-[12px] font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 rounded-lg border border-hub-border">
                <table className="w-full text-left border-collapse text-xs text-hub-text-sec">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-hub-panel/80 border-b border-hub-border text-hub-text font-semibold">{children}</thead>;
          },
          th({ children }) {
            return <th className="p-2.5 font-semibold text-hub-text">{children}</th>;
          },
          td({ children }) {
            return <td className="p-2.5 border-b border-hub-border/40">{children}</td>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-hub-accent/70 pl-3.5 my-2 text-hub-text-sec italic bg-hub-accent/5 py-1 rounded-r-md">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-[17px] font-bold text-hub-text mt-3 mb-1.5">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-[15px] font-bold text-hub-text mt-2.5 mb-1">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-[14px] font-semibold text-hub-text mt-2 mb-1">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-1 my-1.5 text-hub-text-sec">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-1 my-1.5 text-hub-text-sec">{children}</ol>;
          },
          li({ children }) {
            return <li className="text-hub-text">{children}</li>;
          },
          p({ children }) {
            return <p className="mb-2 last:mb-0">{children}</p>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-hub-accent-hi hover:underline font-medium"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-[10px] overflow-hidden border border-hub-border bg-[#121415] shadow-md group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#181B1C] border-b border-hub-border/60 text-[11px] text-hub-text-muted">
        <span className="font-mono uppercase font-semibold text-hub-text-sec tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-hub-text transition-colors p-1 rounded hover:bg-hub-hover"
          title="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon size={12} className="text-hub-accent" />
              <span className="text-hub-accent text-[10px] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon size={12} />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="p-3.5 overflow-x-auto text-[12.5px] font-mono text-[#E6EDF3] leading-relaxed select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

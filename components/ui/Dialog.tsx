'use client';

import React, { useEffect, useRef, ReactNode, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { XIcon } from '../icons';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function Dialog({ open, onClose, title, description, children, className, maxWidth = 'max-w-md' }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  // Trap focus
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    panelRef.current?.focus();
    return () => prev?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'w-full bg-hub-panel border border-hub-border rounded-2xl p-6 shadow-hub-float animate-scale-in outline-none',
          maxWidth,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 id="dialog-title" className="text-hub-xl font-bold text-hub-text">{title}</h2>
            {description && <p className="text-hub-xs text-hub-text-muted mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-hub-sm text-hub-text-muted hover:text-hub-text hover:bg-hub-hover transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <XIcon size={14} />
          </button>
        </div>
        {/* Content */}
        {children}
      </div>
    </div>
  );
}

/* ─── Dialog Footer Helper ─── */

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-end gap-2.5 pt-5 mt-5 border-t border-hub-border/50', className)}>
      {children}
    </div>
  );
}

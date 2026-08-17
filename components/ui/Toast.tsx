'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { XIcon, CheckIcon } from '../icons';

/* ─── Types ─── */

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

/* ─── Variant Styles ─── */

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error:   'border-red-500/30 bg-red-500/10 text-red-400',
  info:    'border-sky-500/30 bg-sky-500/10 text-sky-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

const variantIcons: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

/* ─── Single Toast ─── */

function ToastNotification({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(item.id), 200);
    }, item.duration);
    return () => clearTimeout(timerRef.current);
  }, [item.id, item.duration, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-4 py-3 rounded-hub-md border backdrop-blur-md shadow-hub-float',
        'text-hub-sm font-medium transition-all duration-200',
        isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-in-left',
        variantStyles[item.variant]
      )}
    >
      <span className="text-sm shrink-0">{variantIcons[item.variant]}</span>
      <span className="flex-1 text-hub-text">{item.message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(item.id), 200);
        }}
        className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors text-hub-text-muted"
      >
        <XIcon size={10} />
      </button>
    </div>
  );
}

/* ─── Provider ─── */

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration = 3000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]);
  }, []);

  const value: ToastContextValue = {
    toast,
    success: useCallback((m: string) => toast(m, 'success'), [toast]),
    error:   useCallback((m: string) => toast(m, 'error'),   [toast]),
    info:    useCallback((m: string) => toast(m, 'info'),    [toast]),
    warning: useCallback((m: string) => toast(m, 'warning'), [toast]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-auto max-w-sm">
        {toasts.map((t) => (
          <ToastNotification key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

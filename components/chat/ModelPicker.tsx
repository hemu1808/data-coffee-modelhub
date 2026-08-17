'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { ProviderName } from '../../types';
import { CheckIcon } from '../icons';
import { MOCK_MODELS } from '../../data/mock';

interface ModelPickerProps {
  onClose: () => void;
}

export function ModelPicker({ onClose }: ModelPickerProps) {
  const { selectedModelId, setSelectedModelId } = useUIStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const grouped = useMemo(() => {
    const map = new Map<ProviderName, typeof MOCK_MODELS>();
    MOCK_MODELS.forEach((m) => {
      if (!map.has(m.provider)) map.set(m.provider, []);
      map.get(m.provider)!.push(m);
    });
    return map;
  }, []);

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full right-0 mb-2 w-64 rounded-hub-md bg-hub-side border border-hub-border shadow-hub-float animate-scale-in origin-bottom-right z-50 overflow-hidden"
    >
      <div className="px-3 pt-3 pb-1.5 text-hub-xs font-semibold text-hub-text-muted uppercase tracking-wide">
        Select model
      </div>

      {[...grouped.entries()].map(([provider, models]) => (
        <div key={provider}>
          <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-hub-text-muted/70 uppercase tracking-wider">
            {provider}
          </div>
          {models.map((m) => {
            const active = m.id === selectedModelId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModelId(m.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  active ? 'bg-hub-active text-hub-text' : 'text-hub-text-sec hover:bg-hub-hover hover:text-hub-text'
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-hub-sm font-medium truncate">{m.name}</div>
                  <div className="text-[11px] text-hub-text-muted truncate">{m.desc}</div>
                </div>
                {active && <span className="text-hub-accent shrink-0"><CheckIcon size={14} /></span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MOCK_MODELS } from '../../data/mock';
import { AIModel, ArenaEntry } from '../../types';
import { useUserStore } from '../../store/useUserStore';
import { streamChatMessage } from '../../services/api';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { SendIcon, ArenaIcon, CheckIcon, SparkleIcon, ZapIcon } from '../icons';
import { useToast } from '../ui/Toast';

const PRESET_BATTLES = [
  'Compare Redis vs Dragonfly for high-throughput distributed caching.',
  'Write a TypeScript rate-limiter using token bucket algorithm with tests.',
  'Analyze the trade-offs between REST, GraphQL, and gRPC for microservices.',
];

export function ModelArena() {
  const { apiKeys, deductUsage } = useUserStore();
  const toast = useToast();

  const [modelAId, setModelAId] = useState<string>('claude-sonnet');
  const [modelBId, setModelBId] = useState<string>('gpt-5');
  const [modelCId, setModelCId] = useState<string>('gemini-pro');
  const [threeColumns, setThreeColumns] = useState<boolean>(false);

  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const [entries, setEntries] = useState<Record<string, ArenaEntry>>({
    slotA: { id: 'slotA', modelId: 'claude-sonnet', status: 'idle', content: '' },
    slotB: { id: 'slotB', modelId: 'gpt-5', status: 'idle', content: '' },
    slotC: { id: 'slotC', modelId: 'gemini-pro', status: 'idle', content: '' },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSlots = threeColumns ? ['slotA', 'slotB', 'slotC'] : ['slotA', 'slotB'];

  const getModel = (id: string): AIModel => MOCK_MODELS.find((m) => m.id === id) || MOCK_MODELS[0];

  const handleRunBattle = async (battlePrompt?: string) => {
    const text = (battlePrompt || prompt).trim();
    if (!text || isRunning) return;

    setIsRunning(true);
    setWinner(null);
    deductUsage(text, 2.5);

    const targetSlots = threeColumns
      ? [
          { slot: 'slotA', modelId: modelAId },
          { slot: 'slotB', modelId: modelBId },
          { slot: 'slotC', modelId: modelCId },
        ]
      : [
          { slot: 'slotA', modelId: modelAId },
          { slot: 'slotB', modelId: modelBId },
        ];

    // Reset slots
    setEntries((prev) => {
      const updated = { ...prev };
      targetSlots.forEach(({ slot, modelId }) => {
        updated[slot] = {
          id: slot,
          modelId,
          status: 'streaming',
          content: '',
        };
      });
      return updated;
    });

    // Execute parallel streaming inference
    const promises = targetSlots.map(async ({ slot, modelId }) => {
      try {
        const res = await streamChatMessage(
          {
            prompt: text,
            model: modelId,
            apiKeys,
          },
          (accumulatedText) => {
            setEntries((prev) => ({
              ...prev,
              [slot]: {
                ...prev[slot],
                content: accumulatedText,
                status: 'streaming',
              },
            }));
          }
        );

        const tokenEstimate = Math.max(10, Math.round(res.content.length / 3.8));
        const estimatedCost = (tokenEstimate / 1000) * 0.003;

        setEntries((prev) => ({
          ...prev,
          [slot]: {
            ...prev[slot],
            status: 'completed',
            content: res.content,
            ttftMs: res.ttftMs,
            totalTimeMs: res.totalTimeMs,
            tokenCount: tokenEstimate,
            cost: estimatedCost,
          },
        }));
      } catch (err: any) {
        setEntries((prev) => ({
          ...prev,
          [slot]: {
            ...prev[slot],
            status: 'error',
            error: err?.message || 'Inference error',
          },
        }));
      }
    });

    await Promise.allSettled(promises);
    setIsRunning(false);
    toast.success('Arena battle completed! Vote for the best response.');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-hub-bg overflow-hidden animate-fade-in">
      {/* Arena Top Header */}
      <header className="shrink-0 flex items-center justify-between px-6 h-14 border-b border-hub-border bg-hub-bg/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-hub-accent/15 border border-hub-accent/30 flex items-center justify-center text-hub-accent">
            <ArenaIcon size={16} />
          </div>
          <div>
            <h1 className="text-hub-base font-bold text-hub-text leading-tight flex items-center gap-2">
              Model Arena
              <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-hub-panel border border-hub-border text-hub-text-muted font-mono font-normal">
                Side-by-Side Benchmark
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setThreeColumns(!threeColumns)}
            className="text-xs text-hub-text-sec hover:text-hub-text bg-hub-panel border border-hub-border px-3 py-1.5 rounded-[8px] transition-colors"
          >
            {threeColumns ? 'Switch to 2-Way Arena' : 'Switch to 3-Way Arena'}
          </button>
        </div>
      </header>

      {/* Preset Prompts Pill Bar */}
      <div className="shrink-0 flex items-center gap-2 px-6 py-2 bg-hub-panel/40 border-b border-hub-border/50 overflow-x-auto text-xs">
        <span className="text-hub-text-muted font-medium shrink-0 flex items-center gap-1">
          <SparkleIcon size={13} /> Quick Prompts:
        </span>
        {PRESET_BATTLES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(preset);
              handleRunBattle(preset);
            }}
            disabled={isRunning}
            className="shrink-0 bg-hub-panel hover:bg-hub-hover text-hub-text-sec hover:text-hub-text border border-hub-border px-2.5 py-1 rounded-full transition-colors truncate max-w-xs disabled:opacity-50"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Split Comparison Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-hub-border overflow-y-auto min-h-0">
        {/* Model A */}
        <ArenaColumn
          slot="slotA"
          title="Candidate 1"
          selectedModelId={modelAId}
          onSelectModel={setModelAId}
          entry={entries.slotA}
          isWinner={winner === 'slotA'}
          onVote={() => setWinner('slotA')}
        />

        {/* Model B */}
        <ArenaColumn
          slot="slotB"
          title="Candidate 2"
          selectedModelId={modelBId}
          onSelectModel={setModelBId}
          entry={entries.slotB}
          isWinner={winner === 'slotB'}
          onVote={() => setWinner('slotB')}
        />

        {/* Model C (Optional 3-way battle) */}
        {threeColumns && (
          <ArenaColumn
            slot="slotC"
            title="Candidate 3"
            selectedModelId={modelCId}
            onSelectModel={setModelCId}
            entry={entries.slotC}
            isWinner={winner === 'slotC'}
            onVote={() => setWinner('slotC')}
          />
        )}
      </div>

      {/* Synchronized Composer */}
      <div className="shrink-0 p-4 border-t border-hub-border bg-hub-panel/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-end gap-2 bg-hub-bg border border-hub-border focus-within:border-hub-accent rounded-xl p-3 shadow-lg transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunBattle();
              }
            }}
            placeholder="Enter a prompt to run simultaneously across all arena models… (Enter to run)"
            className="flex-1 bg-transparent text-hub-sm text-hub-text placeholder:text-hub-text-muted outline-none resize-none max-h-32"
          />
          <button
            onClick={() => handleRunBattle()}
            disabled={!prompt.trim() || isRunning}
            className="h-8 px-4 rounded-lg bg-hub-accent hover:bg-hub-accent-hi text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all shadow-md active:scale-95 shrink-0"
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Battling…
              </>
            ) : (
              <>
                <ZapIcon size={13} />
                Run Battle
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArenaColumn({
  slot,
  title,
  selectedModelId,
  onSelectModel,
  entry,
  isWinner,
  onVote,
}: {
  slot: string;
  title: string;
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  entry: ArenaEntry;
  isWinner: boolean;
  onVote: () => void;
}) {
  const model = MOCK_MODELS.find((m) => m.id === selectedModelId) || MOCK_MODELS[0];

  return (
    <div className={`flex flex-col h-full min-h-0 bg-hub-bg ${isWinner ? 'bg-hub-accent/5 ring-1 ring-hub-accent/40' : ''}`}>
      {/* Column Header */}
      <div className="shrink-0 p-3.5 border-b border-hub-border/70 bg-hub-panel/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: model.color }} />
          <select
            value={selectedModelId}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent text-xs font-bold text-hub-text outline-none cursor-pointer hover:text-hub-accent transition-colors"
          >
            {MOCK_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-hub-panel text-hub-text">
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>

        {/* Status / Winner Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {entry.status === 'streaming' && (
            <span className="text-[10px] text-hub-accent font-semibold flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-hub-accent" /> Streaming
            </span>
          )}
          {entry.status === 'completed' && (
            <button
              onClick={onVote}
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border transition-all ${
                isWinner
                  ? 'bg-hub-accent text-white border-hub-accent shadow-sm'
                  : 'border-hub-border text-hub-text-muted hover:border-hub-accent hover:text-hub-text'
              }`}
            >
              {isWinner ? '🏆 Preferred' : 'Vote as Winner'}
            </button>
          )}
        </div>
      </div>

      {/* Latency & Cost Metrics Bar */}
      {entry.status === 'completed' && (
        <div className="shrink-0 px-3.5 py-1.5 bg-hub-bg/90 border-b border-hub-border/40 flex items-center justify-between text-[11px] font-mono text-hub-text-muted">
          <span>TTFT: <strong className="text-hub-text">{entry.ttftMs}ms</strong></span>
          <span>Total: <strong className="text-hub-text">{((entry.totalTimeMs || 0) / 1000).toFixed(2)}s</strong></span>
          <span>Tokens: <strong className="text-hub-text">{entry.tokenCount}</strong></span>
          <span>Cost: <strong className="text-hub-accent">${entry.cost?.toFixed(4)}</strong></span>
        </div>
      )}

      {/* Output Content */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0 text-hub-sm">
        {entry.status === 'idle' ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-hub-text-muted">
            <span className="text-2xl mb-2 opacity-50">⚖️</span>
            <p className="text-xs">Ready for battle prompt</p>
          </div>
        ) : entry.status === 'error' ? (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {entry.error}
          </div>
        ) : (
          <MarkdownRenderer content={entry.content} />
        )}
      </div>
    </div>
  );
}

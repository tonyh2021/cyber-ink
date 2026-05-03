"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { Hammer, ArrowUp, AlertCircle, X } from "lucide-react";
import type { PolishHistoryEntry } from "@/types";

interface PolishDialogProps {
  node: string;
  articleTitle: string;
  history: PolishHistoryEntry[];
  selectedRound: number | null;
  onSelectRound: (round: number) => void;
  instruction: string;
  onInstructionChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  streamText: string;
  quote: string | null;
  onClearQuote: () => void;
}

function extractStreamingSummary(text: string): string | null {
  if (!text.startsWith("---")) return null;
  const secondDash = text.indexOf("\n---\n", 4);
  if (secondDash === -1) {
    const partial = text.slice(4).trim();
    return partial || null;
  }
  return text.slice(4, secondDash).trim() || null;
}

export function PolishDialog({
  node,
  articleTitle,
  history,
  selectedRound,
  onSelectRound,
  instruction,
  onInstructionChange,
  onSend,
  isLoading,
  streamText,
  quote,
  onClearQuote,
}: PolishDialogProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [history, isLoading, streamText]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [instruction, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (instruction.trim() && !isLoading) onSend();
    }
  };

  const rounds = useMemo(() => {
    const result: Array<{
      instruction: string;
      quote: string | undefined;
      summary: string | null;
      index: number;
      pending: boolean;
      error: boolean;
    }> = [];

    let roundIdx = 0;
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      if (entry.role !== "user") continue;

      const next = history[i + 1];
      const hasAssistant = next?.role === "assistant";

      result.push({
        instruction: entry.content,
        quote: entry.quote,
        summary: hasAssistant
          ? next.error
            ? null
            : next.summary || "Changes applied."
          : null,
        index: roundIdx,
        pending: !hasAssistant,
        error: hasAssistant ? !!next.error : false,
      });
      roundIdx++;
      if (hasAssistant) i++;
    }

    return result;
  }, [history]);

  const streamingSummary = isLoading
    ? extractStreamingSummary(streamText)
    : null;

  return (
    <div className="relative z-20 flex flex-col h-full w-full md:w-[440px] shrink-0 bg-surface-card shadow-[12px_0_12px_-4px_rgba(0,0,0,0.09)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <Hammer size={16} className="text-brand-accent -translate-y-0.5" />
          <span className="text-[15px] font-bold text-text-primary font-sans">
            Polish
          </span>
          <span className="text-[15px] text-text-muted">·</span>
          <span className="text-[14px] font-bold text-brand-accent font-mono tracking-[0.5px]">
            {node}
          </span>
        </div>
        <span className="text-[13px] text-text-secondary mt-1 block">
          {articleTitle}
        </span>
      </div>

      {/* Conversation thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto py-2">
        {rounds.map((round) => (
          <div key={round.index}>
            {/* User message */}
            <div className="px-5 py-3">
              <span className="text-[11px] font-semibold text-text-muted tracking-[0.5px]">
                You
              </span>
              <div className="mt-1 rounded-standard border border-border-default bg-surface-root p-3 relative">
                {round.quote && (
                  <div className="border-l-2 border-brand-accent pl-2.5 mb-2 group/quote">
                    <p className="text-[12px] text-text-secondary leading-relaxed italic truncate">
                      {round.quote}
                    </p>
                    <div className="invisible opacity-0 group-hover/quote:visible group-hover/quote:opacity-100 transition-opacity duration-200 absolute -left-px -right-px -top-px z-50 rounded-standard border border-border-default bg-surface-root p-3 shadow-lg">
                      <div className="border-l-2 border-brand-accent pl-2.5 mb-2">
                        <p className="text-[12px] text-text-secondary leading-relaxed italic whitespace-pre-wrap">
                          {round.quote}
                        </p>
                      </div>
                      <p className="text-[13px] text-text-primary leading-relaxed">
                        {round.instruction}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-[13px] text-text-primary leading-relaxed">
                  {round.instruction}
                </p>
              </div>
            </div>

            {/* Assistant message — completed */}
            {!round.pending && !round.error && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => !isLoading && onSelectRound(round.index)}
                onKeyDown={(e) => {
                  if (!isLoading && (e.key === "Enter" || e.key === " "))
                    onSelectRound(round.index);
                }}
                className={`w-full text-left px-5 py-3 transition-colors select-text ${
                  isLoading
                    ? "cursor-default opacity-60"
                    : "cursor-pointer"
                } ${
                  selectedRound === round.index
                    ? "bg-brand-accent-dim border-l-[3px] border-l-brand-accent"
                    : isLoading ? "bg-surface-panel" : "hover:bg-brand-accent-dim bg-surface-panel"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Hammer
                    size={12}
                    className="text-brand-accent -translate-y-0.5"
                  />
                  <span className="text-[11px] font-semibold text-text-accent tracking-[0.5px]">
                    Assistant
                  </span>
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed mt-1">
                  {round.summary}
                </p>
              </div>
            )}

            {/* Assistant message — error */}
            {round.error && (
              <div className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-color-danger" />
                  <span className="text-[11px] font-semibold text-color-danger tracking-[0.5px]">
                    Assistant
                  </span>
                </div>
                <p className="text-[13px] text-color-danger/80 mt-1">
                  Failed to polish. Please try again.
                </p>
              </div>
            )}

            {/* Assistant message — streaming */}
            {round.pending && isLoading && (
              <div className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <Hammer
                    size={12}
                    className="text-brand-accent -translate-y-0.5 animate-hammer-work"
                  />
                  <span className="text-[11px] font-semibold text-text-accent tracking-[0.5px]">
                    Assistant
                  </span>
                </div>
                <p className="text-[13px] text-text-muted mt-1 animate-pulse">
                  {streamingSummary || "Polishing..."}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] bg-surface-card">
        {quote && (
          <div className="flex items-start gap-2 mb-2 px-1 group/inputquote">
            <div className="flex-1 min-w-0 border-l-2 border-brand-accent pl-2.5 overflow-hidden max-h-[1.5em] group-hover/inputquote:max-h-[200px] transition-[max-height] duration-300 ease-in-out">
              <p className="text-[12px] text-text-secondary leading-relaxed italic whitespace-pre-wrap">
                {quote}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearQuote}
              className="shrink-0 p-0.5 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="relative rounded-standard border border-border-default bg-surface-root">
          <textarea
            ref={textareaRef}
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what to polish..."
            disabled={isLoading}
            rows={2}
            className="w-full resize-none bg-transparent p-3 pr-12 pb-3 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!instruction.trim() || isLoading}
            className="absolute bottom-2.5 right-2.5 flex items-center justify-center w-8 h-8 rounded-standard bg-brand-accent text-text-on-accent disabled:opacity-40 hover:bg-brand-accent-hover transition-colors"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

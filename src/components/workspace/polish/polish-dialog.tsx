"use client";

import { useRef, useEffect, useCallback } from "react";
import { Hammer, Sparkles, ArrowUp } from "lucide-react";
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
}: PolishDialogProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [history]);

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

  const rounds: Array<{ instruction: string; summary: string; index: number }> =
    [];
  for (let i = 0; i < history.length; i += 2) {
    const userEntry = history[i];
    const assistantEntry = history[i + 1];
    if (userEntry?.role === "user" && assistantEntry?.role === "assistant") {
      rounds.push({
        instruction: userEntry.content,
        summary: assistantEntry.summary || "Changes applied.",
        index: Math.floor(i / 2),
      });
    }
  }

  return (
    <div className="flex flex-col h-full w-[440px] shrink-0 bg-surface-card shadow-[12px_0_12px_-4px_rgba(0,0,0,0.09)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <Hammer size={16} className="text-brand-accent" />
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
              <div className="mt-1 rounded-standard border border-border-default bg-surface-root p-3">
                <p className="text-[13px] text-text-primary leading-relaxed">
                  {round.instruction}
                </p>
              </div>
            </div>

            {/* Assistant message */}
            <button
              type="button"
              onClick={() => onSelectRound(round.index)}
              className={`w-full text-left px-5 py-3 transition-colors ${
                selectedRound === round.index
                  ? "bg-brand-accent-dim border-l-[3px] border-l-brand-accent"
                  : "hover:bg-surface-panel"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-brand-accent" />
                <span className="text-[11px] font-semibold text-text-accent tracking-[0.5px]">
                  Assistant
                </span>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed mt-1">
                {round.summary}
              </p>
            </button>
          </div>
        ))}

        {isLoading && (
          <div className="px-5 py-3">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-brand-accent animate-pulse" />
              <span className="text-[11px] font-semibold text-text-accent tracking-[0.5px]">
                Assistant
              </span>
            </div>
            <p className="text-[13px] text-text-muted mt-1">Polishing...</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] bg-surface-card">
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

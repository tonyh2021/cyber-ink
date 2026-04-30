"use client";

import { useCallback, useRef, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface InstructionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  canGenerate?: boolean;
  loading?: boolean;
  onGenerate?: () => void;
}

export function InstructionInput({
  value,
  onChange,
  disabled,
  canGenerate,
  loading,
  onGenerate,
}: InstructionInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canGenerate && onGenerate) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-standard border border-border-default bg-surface-root">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Write a sharp analytical piece..."
          disabled={disabled}
          rows={2}
          className="w-full resize-none bg-transparent p-3 pr-12 pb-10 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || disabled}
            title="Generate new version"
            className="flex items-center justify-center w-8 h-8 rounded-standard bg-brand-accent text-text-on-accent disabled:opacity-40 hover:bg-brand-accent-hover transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

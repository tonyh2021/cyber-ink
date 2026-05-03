"use client";

import { forwardRef, useCallback, useRef, useEffect, useImperativeHandle } from "react";
import { Sparkles, Square } from "lucide-react";

interface InstructionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  canGenerate?: boolean;
  loading?: boolean;
  onGenerate?: () => void;
  onStop?: () => void;
}

export const InstructionInput = forwardRef<
  HTMLTextAreaElement,
  InstructionInputProps
>(function InstructionInput(
  { value, onChange, disabled, canGenerate, loading, onGenerate, onStop },
  forwardedRef,
) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(forwardedRef, () => innerRef.current!);

  const autoResize = useCallback(() => {
    const el = innerRef.current;
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
          ref={innerRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Write a sharp analytical piece..."
          disabled={disabled}
          rows={2}
          className="w-full resize-none bg-transparent p-3 pr-12 pb-10 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none disabled:opacity-50"
        />
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
          {loading ? (
            <button
              type="button"
              onClick={onStop}
              title="Stop generation"
              className="flex items-center justify-center w-8 h-8 rounded-standard bg-danger text-text-on-accent hover:bg-danger/80 transition-colors"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate || disabled}
              title="Generate new version"
              className="flex items-center justify-center w-8 h-8 rounded-standard bg-brand-accent text-text-on-accent disabled:opacity-40 hover:bg-brand-accent-hover transition-colors"
            >
              <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

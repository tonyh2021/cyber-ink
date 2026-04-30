"use client";

import { useCallback, useRef, useEffect } from "react";

interface InstructionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function InstructionInput({
  value,
  onChange,
  disabled,
}: InstructionInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [value, autoResize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="e.g. Write a sharp analytical piece..."
      disabled={disabled}
      rows={2}
      className="resize-none rounded-standard border border-border-subtle bg-surface-root p-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent-dim disabled:opacity-50"
    />
  );
}

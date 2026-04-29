"use client";

import { useCallback, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

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
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter your writing instruction..."
      disabled={disabled}
      className="min-h-[120px] resize-none bg-surface-panel text-text-primary placeholder:text-text-muted border-border-default focus:border-brand-accent focus:ring-brand-accent-dim rounded-standard font-sans text-sm leading-relaxed"
      rows={4}
    />
  );
}

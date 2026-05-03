"use client";

import { Quote } from "lucide-react";

interface SelectionPopoverProps {
  rect: DOMRect;
  onQuote: () => void;
  popoverRef: (el: HTMLElement | null) => void;
}

export function SelectionPopover({
  rect,
  onQuote,
  popoverRef,
}: SelectionPopoverProps) {
  const top = rect.top - 48;
  const left = rect.left;

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 flex items-center rounded-standard bg-surface-panel shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
      style={{
        top: Math.max(4, top),
        left: Math.max(4, left),
      }}
    >
      <button
        type="button"
        onClick={onQuote}
        className="flex items-center gap-1.5 px-3 py-2.5 text-[14px] font-semibold text-text-primary hover:text-brand-accent hover:bg-brand-accent-dim rounded-standard transition-colors"
      >
        <Quote size={14} />
        Quote
      </button>
    </div>
  );
}

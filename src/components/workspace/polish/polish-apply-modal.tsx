"use client";

import { useState } from "react";
import type { PolishApplyChoice } from "@/types";

interface PolishApplyModalProps {
  node: string;
  original: string;
  previous: string | null;
  current: string | null;
  onApply: (pick: PolishApplyChoice) => void;
  onCancel: () => void;
}

export function PolishApplyModal({
  node,
  original,
  previous,
  current,
  onApply,
  onCancel,
}: PolishApplyModalProps) {
  const [pick, setPick] = useState<PolishApplyChoice>("current");

  const options: Array<{
    value: PolishApplyChoice;
    label: string;
    preview: string | null;
    disabled: boolean;
  }> = [
    { value: "original", label: "Original", preview: original, disabled: false },
    {
      value: "previous",
      label: "Previous Round",
      preview: previous,
      disabled: previous === null,
    },
    {
      value: "current",
      label: "Current",
      preview: current,
      disabled: current === null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="w-[600px] max-h-[640px] flex flex-col rounded-modal bg-surface-card shadow-[0_8px_32px_4px_rgba(0,0,0,0.19)]">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 border-b border-border-default">
          <h2 className="text-lg font-bold text-text-primary font-sans">
            Commit Polish
          </h2>
          <p className="text-[14px] text-text-secondary mt-1.5">
            Choose which version to keep for {node}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-3">
          {options.map((opt) => {
            if (opt.disabled) return null;
            const selected = pick === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPick(opt.value)}
                className={`w-full text-left rounded-standard p-4 flex gap-3 transition-all ${
                  selected
                    ? "bg-brand-accent-dim border-2 border-brand-accent"
                    : "bg-surface-root border border-border-default hover:border-text-muted"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  <div
                    className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                      selected
                        ? "border-brand-accent"
                        : "border-border-default"
                    }`}
                  >
                    {selected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-semibold text-text-primary">
                    {opt.label}
                  </span>
                  {opt.preview && (
                    <p className="text-[11px] text-text-muted font-mono leading-relaxed mt-1.5 line-clamp-3">
                      {opt.preview.slice(0, 250)}
                      {opt.preview.length > 250 ? "..." : ""}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-7 py-4 border-t border-border-default">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply(pick)}
            className="px-5 py-2 text-[13px] font-bold rounded-standard bg-brand-accent text-text-on-accent hover:bg-brand-accent-hover transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

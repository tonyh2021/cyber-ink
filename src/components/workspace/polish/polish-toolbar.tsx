"use client";

import { useState } from "react";

type DiffMode = "previous" | "original" | null;

interface PolishToolbarProps {
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  onApply: () => void;
  onDiscard: () => void;
}

export function PolishToolbar({
  diffMode,
  onDiffModeChange,
  onApply,
  onDiscard,
}: PolishToolbarProps) {
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const segmentClass = (active: boolean) =>
    `px-3.5 py-1.5 text-[13px] font-sans transition-colors ${
      active
        ? "bg-brand-accent text-text-on-accent font-semibold"
        : "bg-surface-card text-text-secondary hover:text-text-primary"
    }`;

  return (
    <div className="relative flex items-center justify-center px-6 py-2.5 bg-surface-card border-b border-border-default">
      <div className="flex items-center rounded-standard border border-border-default overflow-hidden">
        <button
          type="button"
          onClick={() => onDiffModeChange(null)}
          className={segmentClass(diffMode === null)}
        >
          Current
        </button>
        <button
          type="button"
          onClick={() => onDiffModeChange("previous")}
          className={`${segmentClass(diffMode === "previous")} border-l border-border-default`}
        >
          vs Previous
        </button>
        <button
          type="button"
          onClick={() => onDiffModeChange("original")}
          className={`${segmentClass(diffMode === "original")} border-l border-border-default`}
        >
          vs Original
        </button>
      </div>

      <div className="absolute right-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setConfirmDiscard(true)}
          className="text-[13px] font-medium text-text-secondary hover:text-color-danger hover:bg-(--color-danger-bg) px-3 py-1.5 rounded-standard transition-colors"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onApply}
          className="text-[13px] font-semibold text-brand-accent hover:text-brand-accent-hover hover:bg-brand-accent-dim px-3 py-1.5 rounded-standard transition-colors"
        >
          Apply
        </button>
      </div>

      {confirmDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-card rounded-modal p-6 shadow-(--shadow-modal) w-80 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-text-primary">
              Discard polish session?
            </h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              All polish rounds and changes will be lost. This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDiscard(false)}
                className="px-4 py-1.5 text-sm font-medium text-text-secondary rounded-standard hover:bg-brand-accent-dim transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDiscard(false);
                  onDiscard();
                }}
                className="px-4 py-1.5 text-sm font-medium text-text-on-accent bg-danger rounded-standard hover:opacity-90 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

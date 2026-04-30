"use client";

type DiffMode = "previous" | "original" | null;

interface PolishToolbarProps {
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  hasPrevious: boolean;
  onApply: () => void;
  onDiscard: () => void;
}

export function PolishToolbar({
  diffMode,
  onDiffModeChange,
  hasPrevious,
  onApply,
  onDiscard,
}: PolishToolbarProps) {
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
          onClick={() => hasPrevious && onDiffModeChange("previous")}
          disabled={!hasPrevious}
          className={`${segmentClass(diffMode === "previous")} border-l border-border-default disabled:opacity-40`}
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
          onClick={onDiscard}
          className="text-[13px] font-medium text-text-secondary hover:text-color-danger hover:bg-[var(--color-danger-bg)] px-3 py-1.5 rounded-standard transition-colors"
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
    </div>
  );
}

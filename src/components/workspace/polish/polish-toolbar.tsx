"use client";

type DiffMode = "previous" | "original" | null;

interface PolishToolbarProps {
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  hasPrevious: boolean;
  onApply: () => void;
}

export function PolishToolbar({
  diffMode,
  onDiffModeChange,
  hasPrevious,
  onApply,
}: PolishToolbarProps) {
  const segmentClass = (active: boolean) =>
    `px-3.5 py-1.5 text-[13px] font-sans transition-colors ${
      active
        ? "bg-brand-accent text-text-on-accent font-semibold"
        : "bg-surface-card text-text-secondary hover:text-text-primary"
    }`;

  return (
    <div className="flex items-center justify-center px-6 py-2.5 bg-surface-card border-b border-border-default">
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

      <button
        type="button"
        onClick={onApply}
        className="absolute right-6 text-[13px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
      >
        Apply
      </button>
    </div>
  );
}

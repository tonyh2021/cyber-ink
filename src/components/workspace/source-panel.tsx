"use client";

interface SourcePanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SourcePanel({ value, onChange, disabled }: SourcePanelProps) {
  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <label className="text-[13px] font-semibold text-text-secondary">
        Source
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste your raw material here..."
        className="flex-1 min-h-[240px] resize-none rounded-standard border border-border-default bg-surface-root p-3 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent-dim disabled:opacity-50"
      />
    </div>
  );
}

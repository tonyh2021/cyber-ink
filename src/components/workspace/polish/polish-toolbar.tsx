"use client";

import { useEffect, useRef, useState } from "react";

type DiffMode = "previous" | "original" | null;

interface PolishToolbarProps {
  diffMode: DiffMode;
  onDiffModeChange: (mode: DiffMode) => void;
  onApply: () => void;
  onDiscard: () => void;
  disabled?: boolean;
}

const COLLAPSE_WIDTH = 520;

export function PolishToolbar({
  diffMode,
  onDiffModeChange,
  onApply,
  onDiscard,
  disabled,
}: PolishToolbarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setCollapsed(entry.contentRect.width < COLLAPSE_WIDTH);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!collapsed) setMenuOpen(false);
  }, [collapsed]);

  const segmentClass = (active: boolean) =>
    `px-3.5 py-1.5 text-[13px] font-sans transition-colors ${
      active
        ? "bg-brand-accent text-text-on-accent font-semibold"
        : "bg-surface-card text-text-secondary hover:text-text-primary"
    }`;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center px-6 py-2.5 bg-surface-card border-b border-border-default"
    >
      <div className="flex items-center rounded-standard border border-border-default overflow-hidden">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDiffModeChange(null)}
          className={segmentClass(diffMode === null)}
        >
          Current
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDiffModeChange("previous")}
          className={`${segmentClass(diffMode === "previous")} border-l border-border-default`}
        >
          vs Previous
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDiffModeChange("original")}
          className={`${segmentClass(diffMode === "original")} border-l border-border-default`}
        >
          vs Original
        </button>
      </div>

      <div className="absolute right-6 flex items-center gap-3">
        {collapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center w-8 h-8 rounded-standard text-text-secondary hover:text-text-primary hover:bg-surface-panel transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <circle cx="3" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13" cy="8" r="1.5" />
              </svg>
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 bg-surface-card border border-border-default rounded-standard shadow-(--shadow-modal) py-1 min-w-[120px]">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDiscard(true);
                    }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-color-danger hover:bg-(--color-danger-bg) transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setMenuOpen(false);
                      onApply();
                    }}
                    className="w-full text-left px-4 py-2 text-[13px] font-semibold text-brand-accent hover:text-brand-accent-hover hover:bg-brand-accent-dim transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setConfirmDiscard(true)}
              className="text-[13px] font-medium text-text-secondary hover:text-color-danger hover:bg-(--color-danger-bg) px-3 py-1.5 rounded-standard transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Discard
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={onApply}
              className="text-[13px] font-semibold text-brand-accent hover:text-brand-accent-hover hover:bg-brand-accent-dim px-3 py-1.5 rounded-standard transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Apply
            </button>
          </>
        )}
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

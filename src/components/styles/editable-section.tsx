"use client";

import { useState } from "react";
import { Pencil, Download, Upload } from "lucide-react";

interface EditableSectionProps {
  title: string;
  value: string;
  onSave: (value: string) => void;
  onExport: () => void;
  onImport: () => void;
}

const textClass =
  "font-mono text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap";

export function EditableSection({
  title,
  value,
  onSave,
  onExport,
  onImport,
}: EditableSectionProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px] py-0.5">
          {title}
        </h2>
        {!editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={onImport}
              className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
              title="Import"
            >
              <Upload size={12} />
            </button>
            <button
              onClick={onExport}
              className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
              title="Export"
            >
              <Download size={12} />
            </button>
            <button
              onClick={() => {
                setDraft(value);
                setEditing(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-text-muted hover:text-text-primary rounded-standard transition-colors"
            >
              <Pencil size={12} />
              Edit
            </button>
          </div>
        )}
      </div>
      <div className="relative rounded-card border border-border-default bg-surface-canvas shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-[200px]">
        {editing ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={`w-full h-full p-4 pb-12 ${textClass} resize-none bg-transparent outline-none overflow-y-auto`}
              autoFocus
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                onClick={() => {
                  setDraft(value);
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary rounded-standard transition-colors bg-surface-card/80 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSave(draft);
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-[13px] bg-brand-accent text-white rounded-standard hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 h-full overflow-y-auto">
            <pre className={textClass}>{value}</pre>
          </div>
        )}
      </div>
    </section>
  );
}

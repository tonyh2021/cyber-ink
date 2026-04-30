"use client";

import { FilePen } from "lucide-react";
import { OutputStream } from "./output-stream";

interface NodeInfo {
  node: string;
  instruction?: string;
}

interface NodeDisplayProps {
  nodes: NodeInfo[];
  activeNode: string | null;
  onSelectNode: (node: string) => void;
  content: string;
  isLoading?: boolean;
}

export function NodeDisplay({
  nodes,
  activeNode,
  onSelectNode,
  content,
  isLoading,
}: NodeDisplayProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Version tab strip */}
      <div className="flex items-center border-b border-border-default bg-surface-card py-2.5 px-6">
        {nodes.length > 0 ? (
          nodes.map((n) => (
            <button
              key={n.node}
              onClick={() => onSelectNode(n.node)}
              className="relative flex flex-col items-center"
            >
              <span
                className={`px-4 pt-2.5 pb-2 text-sm font-mono tracking-[0.5px] ${
                  n.node === activeNode
                    ? "text-brand-accent font-semibold"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {n.node}
              </span>
              {n.node === activeNode && (
                <div className="h-[3px] w-full rounded-[1px] bg-brand-accent" />
              )}
            </button>
          ))
        ) : (
          <div className="relative flex flex-col items-center">
            <span className="px-4 pt-2.5 pb-2 text-sm font-mono tracking-[0.5px] text-brand-accent font-semibold">
              v1
            </span>
            <div className="h-[3px] w-full rounded-[1px] bg-brand-accent" />
          </div>
        )}
      </div>

      {/* Instruction used for this node */}
      {activeNode && nodes.find((n) => n.node === activeNode)?.instruction && (
        <div className="px-6 py-2.5 bg-surface-panel border-b border-border-default">
          <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase">
            Instruction
          </span>
          <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">
            {nodes.find((n) => n.node === activeNode)!.instruction}
          </p>
        </div>
      )}

      {/* Canvas */}
      {content || isLoading ? (
        <div className="flex-1 overflow-y-auto bg-surface-canvas py-8 px-10">
          <OutputStream content={content} isLoading={isLoading} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-surface-canvas">
          <FilePen size={40} strokeWidth={1.5} className="text-text-muted" />
          <span className="text-base font-semibold text-text-secondary">
            No content yet
          </span>
          <span className="text-[13px] text-text-muted">
            Paste material and click Generate to create your first draft.
          </span>
        </div>
      )}
    </div>
  );
}

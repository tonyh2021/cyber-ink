"use client";

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
      <div className="flex items-center border-b border-border-subtle bg-surface-card px-6">
        {nodes.length > 0 ? (
          nodes.map((n) => (
            <button
              key={n.node}
              onClick={() => onSelectNode(n.node)}
              className="relative flex flex-col items-center"
            >
              <span
                className={`px-4 pt-2.5 pb-2 text-sm font-mono ${
                  n.node === activeNode
                    ? "text-brand-accent font-semibold"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {n.node}
              </span>
              {n.node === activeNode && (
                <div className="h-[3px] w-full rounded-full bg-brand-accent" />
              )}
            </button>
          ))
        ) : (
          <span className="px-4 py-2.5 text-sm font-mono text-text-muted">
            v1
          </span>
        )}
      </div>

      {/* Canvas */}
      {content || isLoading ? (
        <div className="flex-1 overflow-y-auto bg-surface-canvas p-8">
          <OutputStream content={content} isLoading={isLoading} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-surface-canvas">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-text-muted"
          >
            <path d="M12 20h9" />
            <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
          </svg>
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

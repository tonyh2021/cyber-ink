"use client";

import { useRef, useEffect, useState } from "react";
import { FilePen, MessageSquareText } from "lucide-react";
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
  canPolish?: boolean;
  onPolish?: () => void;
}

export function NodeDisplay({
  nodes,
  activeNode,
  onSelectNode,
  content,
  isLoading,
  canPolish,
  onPolish,
}: NodeDisplayProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const instructionRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading && canvasRef.current) {
      canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
    }
  }, [isLoading, content]);

  return (
    <div className="workspace-panel-right relative z-10 flex flex-col flex-1 min-h-0 min-w-0">
      {/* Version tab strip */}
      <div className="flex items-center border-b border-border-default bg-surface-card py-1 px-6">
        <div className="flex items-center flex-1">
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

        {canPolish && onPolish && (
          <button
            type="button"
            onClick={onPolish}
            title="Polish active version"
            className="ml-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-[0_4px_10px_rgba(0,0,0,0.18)] hover:bg-primary/90 transition-colors"
          >
            <MessageSquareText size={15} />
          </button>
        )}
      </div>

      {/* Instruction used for this node */}
      {activeNode && nodes.find((n) => n.node === activeNode)?.instruction && (
        <div
          ref={instructionRef}
          className="relative flex items-start gap-2 px-6 py-2.5 bg-surface-panel overflow-visible"
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
        >
          <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase shrink-0">
            Instruction
          </span>
          <span className="text-[12px] text-text-muted truncate min-w-0">
            {nodes.find((n) => n.node === activeNode)!.instruction}
          </span>
          {showPopover && (
            <div className="absolute top-0 left-0 right-0 z-50 flex items-start gap-2 px-6 py-2.5 bg-surface-panel shadow-lg">
              <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase shrink-0">
                Instruction
              </span>
              <span className="text-[12px] text-text-muted whitespace-pre-wrap">
                {nodes.find((n) => n.node === activeNode)!.instruction}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      {content || isLoading ? (
        <div
          ref={canvasRef}
          className="flex-1 overflow-y-auto bg-surface-canvas py-6 px-4 md:py-8 md:px-10"
        >
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

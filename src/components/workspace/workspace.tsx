"use client";

import { useState, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";
import { ArticleSidebar } from "./article-sidebar";
import { MetadataPanel } from "./metadata-panel";
import { SourcePanel } from "./source-panel";
import { InstructionInput } from "./instruction-input";
import { GenerateButton } from "./generate-button";
import { NodeDisplay } from "./node-display";
import { useSidebar } from "./sidebar-context";

interface NodeInfo {
  node: string;
  instruction?: string;
}

interface WorkspaceProps {
  slug: string;
  title?: string;
  createdAt?: string;
  initialSource?: string;
  initialNodes?: NodeInfo[];
  initialContent?: Record<string, string>;
}

export function Workspace({
  slug,
  title = "New Article",
  createdAt,
  initialSource = "",
  initialNodes = [],
  initialContent = {},
}: WorkspaceProps) {
  const { width: sidebarWidth } = useSidebar();
  const [source, setSource] = useState(initialSource);
  const [instruction, setInstruction] = useState("");
  const [nodes, setNodes] = useState<NodeInfo[]>(initialNodes);
  const [activeNode, setActiveNode] = useState<string | null>(
    initialNodes.length > 0 ? initialNodes[initialNodes.length - 1].node : null
  );
  const [nodeContent, setNodeContent] = useState<Record<string, string>>(initialContent);

  const { completion, isLoading, complete } = useCompletion({
    api: `/api/articles/${slug}/generate`,
    streamProtocol: "text",
    onFinish: (_prompt, completion) => {
      const nextNode = `v${nodes.length + 1}`;
      const newNodeInfo: NodeInfo = { node: nextNode, instruction };
      setNodes((prev) => [...prev, newNodeInfo]);
      setActiveNode(nextNode);
      setNodeContent((prev) => ({ ...prev, [nextNode]: completion }));
    },
  });

  useEffect(() => {
    setSource(initialSource);
    setNodes(initialNodes);
    setNodeContent(initialContent);
    setActiveNode(
      initialNodes.length > 0 ? initialNodes[initialNodes.length - 1].node : null
    );
  }, [slug]);

  const handleGenerate = async () => {
    if (!instruction.trim() || !source.trim() || isLoading) return;
    await complete(instruction, {
      body: { instruction, source },
    });
  };

  const displayContent = isLoading
    ? completion
    : activeNode
      ? nodeContent[activeNode] || ""
      : "";

  const canGenerate = instruction.trim().length > 0 && source.trim().length > 0;

  return (
    <div className="h-screen flex bg-surface-root">
      <ArticleSidebar currentSlug={slug} />

      <div
        className="flex-1 flex flex-col h-full transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="flex h-full">
          {/* Left panel */}
          <div className="w-[440px] shrink-0 flex flex-col gap-4 p-6 px-5 bg-surface-card border-r border-border-subtle">
            <MetadataPanel title={title} slug={slug} createdAt={createdAt} />
            <SourcePanel
              value={source}
              onChange={setSource}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-semibold text-text-secondary">
                Instruction
              </label>
              <InstructionInput
                value={instruction}
                onChange={setInstruction}
                disabled={isLoading}
              />
              <div className="flex justify-end mt-1">
                <GenerateButton
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <NodeDisplay
            nodes={nodes}
            activeNode={activeNode}
            onSelectNode={setActiveNode}
            content={displayContent}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

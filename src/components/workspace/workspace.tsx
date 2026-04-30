"use client";

import { useState, useEffect, useRef } from "react";
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

const MAX_MAIN_VERSIONS = 5;

function getNodeVersion(nodeName: string): number {
  const match = /^v(\d+)$/.exec(nodeName);
  return match ? parseInt(match[1], 10) : 0;
}

function isMainVersionNode(nodeName: string): boolean {
  return /^v\d+$/.test(nodeName);
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
    initialNodes.length > 0 ? initialNodes[initialNodes.length - 1].node : null,
  );
  const [nodeContent, setNodeContent] =
    useState<Record<string, string>>(initialContent);
  const wasLoading = useRef(false);

  const { completion, isLoading, complete } = useCompletion({
    api: `/api/articles/${slug}/generate`,
    streamProtocol: "text",
    onFinish: (_prompt, completion) => {
      let nextNode = "";
      let removedNode: string | null = null;

      setNodes((prev) => {
        const currentMaxVersion = prev.reduce(
          (max, item) => Math.max(max, getNodeVersion(item.node)),
          0,
        );
        nextNode = `v${currentMaxVersion + 1}`;
        const newNodeInfo: NodeInfo = { node: nextNode, instruction };
        const nextNodes = [...prev, newNodeInfo];

        const mainVersionNodes = nextNodes.filter((item) =>
          isMainVersionNode(item.node),
        );

        if (mainVersionNodes.length > MAX_MAIN_VERSIONS) {
          const oldestMainVersion = mainVersionNodes.reduce((oldest, item) =>
            getNodeVersion(item.node) < getNodeVersion(oldest.node)
              ? item
              : oldest,
          );
          removedNode = oldestMainVersion.node;
          return nextNodes.filter((item) => item.node !== removedNode);
        }
        return nextNodes;
      });

      setActiveNode(nextNode);
      setNodeContent((prev) => {
        const nextContent = { ...prev, [nextNode]: completion };
        if (removedNode) {
          delete nextContent[removedNode];
        }
        return nextContent;
      });
    },
  });

  useEffect(() => {
    if (wasLoading.current && !isLoading && nodes.length > 0) {
      setActiveNode(nodes[nodes.length - 1].node);
    }
    wasLoading.current = isLoading;
  }, [isLoading, nodes]);

  const handleGenerate = async () => {
    if (!instruction.trim() || !source.trim() || isLoading) return;

    const mainVersionCount = nodes.filter((item) =>
      isMainVersionNode(item.node),
    ).length;

    if (mainVersionCount >= MAX_MAIN_VERSIONS) {
      const confirmed = window.confirm(
        "You already have 5 versions. Generating a new one will remove the oldest version. Continue?",
      );
      if (!confirmed) return;
    }

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
          <div className="w-[440px] shrink-0 flex flex-col gap-4 p-6 px-5 bg-surface-card border-r border-border-default">
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

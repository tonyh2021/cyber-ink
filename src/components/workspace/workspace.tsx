"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useCompletion } from "@ai-sdk/react";
import { ArticleSidebar } from "./article-sidebar";
import { MetadataPanel } from "./metadata-panel";
import { SourcePanel } from "./source-panel";
import { InstructionInput } from "./instruction-input";
import { NodeDisplay } from "./node-display";
import { PolishDialog } from "./polish/polish-dialog";
import { PolishToolbar } from "./polish/polish-toolbar";
import { PolishDiff } from "./polish/polish-diff";
import { PolishApplyModal } from "./polish/polish-apply-modal";
import { OutputStream } from "./output-stream";
import { useSidebar } from "./sidebar-context";
import type { PolishHistoryEntry, PolishApplyChoice, PolishStatus } from "@/types";

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
  const { width: sidebarWidth, setCollapsed } = useSidebar();

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);
  const [source, setSource] = useState(initialSource);
  const [instruction, setInstruction] = useState("");
  const [nodes, setNodes] = useState<NodeInfo[]>(initialNodes);
  const [activeNode, setActiveNode] = useState<string | null>(
    initialNodes.length > 0 ? initialNodes[initialNodes.length - 1].node : null,
  );
  const [nodeContent, setNodeContent] =
    useState<Record<string, string>>(initialContent);
  const wasLoading = useRef(false);
  const pendingNodeRef = useRef<string | null>(null);

  // Polish mode state
  const [polishActive, setPolishActive] = useState(false);
  const [polishNode, setPolishNode] = useState<string | null>(null);
  const [polishOriginal, setPolishOriginal] = useState("");
  const [polishRounds, setPolishRounds] = useState<string[]>([]);
  const [polishHistory, setPolishHistory] = useState<PolishHistoryEntry[]>([]);
  const [polishInstruction, setPolishInstruction] = useState("");
  const [polishSelectedRound, setPolishSelectedRound] = useState<number | null>(null);
  const [polishDiffMode, setPolishDiffMode] = useState<"previous" | "original" | null>(null);
  const [polishShowApply, setPolishShowApply] = useState(false);
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishStreamText, setPolishStreamText] = useState("");

  const { completion, isLoading, complete } = useCompletion({
    api: `/api/articles/${slug}/generate`,
    streamProtocol: "text",
    onFinish: (_prompt, completion) => {
      const node = pendingNodeRef.current;
      if (!node) return;
      pendingNodeRef.current = null;

      setNodeContent((prev) => ({ ...prev, [node]: completion }));
    },
  });

  // Restore polish session on mount
  useEffect(() => {
    async function checkPolishSession() {
      try {
        const res = await fetch(`/api/articles/${slug}/polish/status`);
        if (!res.ok) return;
        const status: PolishStatus = await res.json();
        if (status.active) {
          setPolishActive(true);
          setPolishNode(status.node);
          setPolishOriginal(status.original);
          setPolishRounds(status.rounds);
          setPolishHistory(status.history);
          if (status.history.length > 0) {
            setPolishSelectedRound(Math.floor(status.history.length / 2) - 1);
          }
        }
      } catch {
        // ignore
      }
    }
    checkPolishSession();
  }, [slug]);

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

    const currentMaxVersion = nodes.reduce(
      (max, item) => Math.max(max, getNodeVersion(item.node)),
      0,
    );
    const nextNode = `v${currentMaxVersion + 1}`;
    pendingNodeRef.current = nextNode;

    let removedNode: string | null = null;
    const newNodeInfo: NodeInfo = { node: nextNode, instruction };
    const nextNodes = [...nodes, newNodeInfo];
    const mainVersionNodes = nextNodes.filter((item) =>
      isMainVersionNode(item.node),
    );

    if (mainVersionNodes.length > MAX_MAIN_VERSIONS) {
      const oldestMainVersion = mainVersionNodes.reduce((oldest, item) =>
        getNodeVersion(item.node) < getNodeVersion(oldest.node) ? item : oldest,
      );
      removedNode = oldestMainVersion.node;
      setNodes(nextNodes.filter((item) => item.node !== removedNode));
    } else {
      setNodes(nextNodes);
    }

    setActiveNode(nextNode);
    if (removedNode) {
      setNodeContent((prev) => {
        const next = { ...prev };
        delete next[removedNode];
        return next;
      });
    }

    await complete(instruction, {
      body: { instruction, source },
    });
  };

  const handleStartPolish = useCallback(async () => {
    if (!activeNode || polishActive || isLoading) return;
    try {
      const res = await fetch(`/api/articles/${slug}/polish/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node: activeNode }),
      });
      if (res.status === 409) {
        // Session exists — restore it
        const statusRes = await fetch(`/api/articles/${slug}/polish/status`);
        const status: PolishStatus = await statusRes.json();
        if (status.active) {
          setPolishActive(true);
          setPolishNode(status.node);
          setPolishOriginal(status.original);
          setPolishRounds(status.rounds);
          setPolishHistory(status.history);
          if (status.history.length > 0) {
            setPolishSelectedRound(Math.floor(status.history.length / 2) - 1);
          }
        }
        return;
      }
      if (!res.ok) return;

      const content = nodeContent[activeNode] || "";
      setPolishActive(true);
      setPolishNode(activeNode);
      setPolishOriginal(content);
      setPolishRounds([]);
      setPolishHistory([]);
      setPolishSelectedRound(null);
      setPolishDiffMode(null);
    } catch {
      // ignore
    }
  }, [activeNode, polishActive, isLoading, slug, nodeContent]);

  const handlePolishRound = useCallback(async () => {
    if (!polishInstruction.trim() || polishLoading) return;

    const instructionText = polishInstruction;
    setPolishInstruction("");
    setPolishLoading(true);
    setPolishStreamText("");

    setPolishHistory((prev) => [
      ...prev,
      { role: "user", content: instructionText },
    ]);

    try {
      const res = await fetch(`/api/articles/${slug}/polish/round`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: instructionText }),
      });

      if (!res.ok || !res.body) {
        setPolishHistory((prev) => [
          ...prev,
          { role: "assistant", content: "", error: true },
        ]);
        setPolishLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setPolishStreamText(fullText);
      }

      // Refresh status to get the persisted state
      const statusRes = await fetch(`/api/articles/${slug}/polish/status`);
      const status: PolishStatus = await statusRes.json();
      if (status.active) {
        setPolishOriginal(status.original);
        setPolishRounds(status.rounds);
        setPolishHistory(status.history);
        setPolishSelectedRound(Math.floor(status.history.length / 2) - 1);
      }
    } catch {
      setPolishHistory((prev) => [
        ...prev,
        { role: "assistant", content: "", error: true },
      ]);
    } finally {
      setPolishLoading(false);
      setPolishStreamText("");
    }
  }, [polishInstruction, polishLoading, slug]);

  const handlePolishApply = useCallback(
    async (pick: PolishApplyChoice) => {
      try {
        const res = await fetch(`/api/articles/${slug}/polish/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pick }),
        });
        if (!res.ok) return;

        const data: { applied: boolean; node: string } = await res.json();
        if (data.applied && polishNode) {
          let newContent = polishOriginal;
          if (pick === "previous" && polishRounds.length >= 2) {
            newContent = polishRounds[polishRounds.length - 2];
          }
          if (pick === "current" && polishRounds.length > 0) {
            newContent = polishRounds[polishRounds.length - 1];
          }

          setNodeContent((prev) => ({
            ...prev,
            [polishNode]: newContent,
          }));
        }

        // Exit polish mode
        setPolishActive(false);
        setPolishNode(null);
        setPolishShowApply(false);
        setPolishDiffMode(null);
        setPolishHistory([]);
        setPolishSelectedRound(null);
      } catch {
        // ignore
      }
    },
    [slug, polishNode, polishOriginal, polishRounds],
  );

  const handlePolishDiscard = useCallback(async () => {
    try {
      await fetch(`/api/articles/${slug}/polish/discard`, { method: "POST" });
    } catch {
      // ignore
    }
    setPolishActive(false);
    setPolishNode(null);
    setPolishDiffMode(null);
    setPolishHistory([]);
    setPolishSelectedRound(null);
  }, [slug]);

  // Determine what to show in the canvas during polish mode
  const getPolishCanvasContent = (): string => {
    // When streaming, strip the summary header and show only article content
    if (polishLoading && polishStreamText) {
      const secondDash = polishStreamText.indexOf("\n---\n", 4);
      if (polishStreamText.startsWith("---") && secondDash !== -1) {
        return polishStreamText.slice(secondDash + 5);
      }
      return "";
    }
    // When a round is selected, show that round's output
    if (polishSelectedRound !== null && polishHistory.length > 0) {
      const assistantIdx = polishSelectedRound * 2 + 1;
      const entry = polishHistory[assistantIdx];
      if (entry?.role === "assistant") return entry.content;
    }
    // Show current polish, or original if no rounds yet
    return polishRounds.length > 0 ? polishRounds[polishRounds.length - 1] : polishOriginal;
  };

  const displayContent =
    isLoading && activeNode === pendingNodeRef.current
      ? completion
      : activeNode
        ? nodeContent[activeNode] || ""
        : "";

  const canGenerate = instruction.trim().length > 0 && source.trim().length > 0;

  return (
    <div className="h-screen flex bg-surface-root">
      <ArticleSidebar currentSlug={slug} />

      <div
        className="flex-1 flex flex-col h-full min-w-0 transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="flex h-full min-w-0">
          {polishActive ? (
            <>
              {/* Polish left panel — conversation dialog */}
              <PolishDialog
                node={polishNode || ""}
                articleTitle={title}
                history={polishHistory}
                selectedRound={polishSelectedRound}
                onSelectRound={setPolishSelectedRound}
                instruction={polishInstruction}
                onInstructionChange={setPolishInstruction}
                onSend={handlePolishRound}
                isLoading={polishLoading}
                streamText={polishStreamText}
              />

              {/* Polish right panel */}
              <div className="flex-1 flex flex-col min-h-0">
                <PolishToolbar
                  diffMode={polishDiffMode}
                  onDiffModeChange={setPolishDiffMode}
                  onApply={() => setPolishShowApply(true)}
                  onDiscard={handlePolishDiscard}
                />

                {polishDiffMode ? (
                  <PolishDiff
                    oldValue={
                      polishDiffMode === "original"
                        ? polishOriginal
                        : polishRounds.length >= 2
                          ? polishRounds[polishRounds.length - 2]
                          : polishOriginal
                    }
                    newValue={polishRounds.length > 0 ? polishRounds[polishRounds.length - 1] : polishOriginal}
                    leftTitle={
                      polishDiffMode === "original" ? "Original" : "Previous"
                    }
                    rightTitle="Current"
                  />
                ) : (
                  <div className="flex-1 overflow-y-auto bg-surface-canvas pt-4 pb-8 px-10">
                    <OutputStream
                      content={getPolishCanvasContent()}
                      isLoading={polishLoading}
                    />
                  </div>
                )}
              </div>

              {/* Apply modal */}
              {polishShowApply && (
                <PolishApplyModal
                  node={polishNode || ""}
                  original={polishOriginal}
                  rounds={polishRounds}
                  onApply={handlePolishApply}
                  onCancel={() => setPolishShowApply(false)}
                />
              )}
            </>
          ) : (
            <>
              {/* Normal left panel */}
              <div className="workspace-panel-middle relative z-20 w-[440px] shrink-0 flex flex-col gap-4 p-6 px-5 bg-surface-card">
                <MetadataPanel title={title} slug={slug} createdAt={createdAt} />
                <SourcePanel
                  value={source}
                  onChange={setSource}
                  disabled={isLoading}
                />
                <InstructionInput
                  value={instruction}
                  onChange={setInstruction}
                  disabled={isLoading}
                  loading={isLoading}
                  canGenerate={canGenerate}
                  onGenerate={handleGenerate}
                />
              </div>

              {/* Normal right panel */}
              <NodeDisplay
                nodes={nodes}
                activeNode={activeNode}
                onSelectNode={setActiveNode}
                content={displayContent}
                isLoading={isLoading}
                canPolish={!!activeNode && !polishActive}
                onPolish={handleStartPolish}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

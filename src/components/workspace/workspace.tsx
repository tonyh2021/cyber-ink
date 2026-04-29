"use client";

import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { InstructionInput } from "./instruction-input";
import { GenerateButton } from "./generate-button";
import { OutputStream } from "./output-stream";
import { Button } from "@/components/ui/button";

interface WorkspaceProps {
  slug: string;
}

export function Workspace({ slug }: WorkspaceProps) {
  const [instruction, setInstruction] = useState("");

  const { completion, isLoading, complete, setCompletion } = useCompletion({
    api: `/api/articles/${slug}/generate`,
    streamProtocol: "text",
  });

  const handleGenerate = async () => {
    if (!instruction.trim() || isLoading) return;
    await complete(instruction, {
      body: { instruction },
    });
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setCompletion("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-3">
        <InstructionInput
          value={instruction}
          onChange={setInstruction}
          disabled={isLoading}
        />
        <div className="flex items-center gap-3">
          <GenerateButton
            onClick={handleGenerate}
            disabled={!instruction.trim()}
            isLoading={isLoading}
          />
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-danger/30 text-danger hover:bg-danger/10 rounded-standard"
          >
            Delete
          </Button>
        </div>
      </div>

      <OutputStream content={completion} isLoading={isLoading} />
    </div>
  );
}

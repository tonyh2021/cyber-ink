"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { ArticleSidebar } from "./article-sidebar";
import { useSidebar } from "./sidebar-context";

export function WorkspaceEmpty() {
  const { width: sidebarWidth, setCollapsed } = useSidebar();

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreate() {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Article", language: "zh" }),
      });
      if (res.ok) {
        const { slug } = await res.json();
        router.push(`/workspace/${slug}`);
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="h-screen flex bg-surface-root">
      <ArticleSidebar />
      <div
        className="flex-1 flex items-center justify-center transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="flex flex-col items-center gap-4">
          <FileText size={48} className="text-text-muted" strokeWidth={1.5} />
          <span className="text-xl font-semibold text-text-primary">
            Create your first article
          </span>
          <span className="text-sm text-text-secondary">
            Paste material, write instructions, and generate drafts.
          </span>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="mt-2 flex items-center justify-center rounded-standard bg-brand-accent py-2 px-5 text-sm font-bold text-white hover:bg-brand-accent-hover disabled:opacity-50 transition-colors"
          >
            {isCreating ? "Creating..." : "New Article"}
          </button>
        </div>
      </div>
    </div>
  );
}

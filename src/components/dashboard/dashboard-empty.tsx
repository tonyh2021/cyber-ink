"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { useSidebar } from "@/components/workspace/sidebar-context";

export function DashboardEmpty() {
  const router = useRouter();
  const { refreshArticles } = useSidebar();
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
        await refreshArticles();
        router.push(`/workspace/${slug}`);
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-surface-card">
      <FileText size={48} strokeWidth={1.5} className="text-text-muted" />
      <h2 className="text-lg font-semibold text-text-secondary">
        No articles yet
      </h2>
      <p className="text-[13px] text-text-muted max-w-xs text-center">
        Create your first article to start writing with AI-powered generation
        and evaluation.
      </p>
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className="mt-2 rounded-standard bg-brand-accent px-5 py-2 text-sm font-bold text-text-on-accent hover:bg-brand-accent-hover disabled:opacity-50 transition-colors"
      >
        {isCreating ? "Creating..." : "New Article"}
      </button>
    </div>
  );
}

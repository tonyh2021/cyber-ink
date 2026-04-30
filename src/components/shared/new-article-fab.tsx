"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useSidebar } from "@/components/workspace/sidebar-context";

export function NewArticleFab() {
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
    <button
      onClick={handleCreate}
      disabled={isCreating}
      className="fixed right-8 bottom-8 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-brand-accent text-white shadow-[0_4px_20px_rgba(0,0,0,0.3),0_8px_32px_rgba(0,0,0,0.15)] hover:bg-brand-accent-hover disabled:opacity-50 transition-colors"
      title="New Article"
    >
      <Plus size={24} className={isCreating ? "animate-spin" : ""} />
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useSidebar } from "@/components/workspace/sidebar-context";

interface ArticleCardProps {
  slug: string;
  title: string;
  createdAt: string;
  versionCount: number;
  activeNode: string | null;
  preview: string;
}

export function ArticleCard({
  slug,
  title,
  createdAt,
  versionCount,
  activeNode,
  preview,
}: ArticleCardProps) {
  const router = useRouter();
  const { refreshArticles } = useSidebar();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dateStr = new Date(createdAt).toLocaleDateString("en-CA");
  const versionText =
    versionCount === 0
      ? "No versions"
      : activeNode
        ? `${versionCount} version${versionCount > 1 ? "s" : ""} · active: ${activeNode}`
        : `${versionCount} version${versionCount > 1 ? "s" : ""}`;

  async function handleDelete() {
    const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    if (res.ok) {
      await refreshArticles();
      router.refresh();
    }
    setConfirmDelete(false);
  }

  return (
    <>
      <div
        onClick={() => router.push(`/workspace/${slug}`)}
        className="group relative cursor-pointer rounded-card border border-border-default bg-surface-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-[shadow,transform] overflow-hidden"
      >
        <div className="h-[88px] bg-surface-canvas p-4 overflow-hidden">
          {preview ? (
            <p className="text-[11px] font-mono leading-relaxed text-text-muted line-clamp-4">
              {preview}
            </p>
          ) : (
            <p className="text-[11px] font-mono text-text-muted italic">
              No content yet
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-semibold text-text-primary tracking-[-0.2px] truncate">
              {title}
            </span>
            <span className="text-[11px] text-text-muted shrink-0">
              {dateStr}
            </span>
          </div>
          <span className="text-xs text-text-secondary">{versionText}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-standard bg-surface-card/80 text-text-muted hover:text-danger transition-opacity"
          title="Delete article"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-card rounded-modal p-6 shadow-(--shadow-modal) w-80 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-text-primary">
              Delete article?
            </h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              This will permanently remove this article and all its versions.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-1.5 text-sm font-medium text-text-secondary rounded-standard hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 text-sm font-medium text-text-on-accent bg-danger rounded-standard hover:opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

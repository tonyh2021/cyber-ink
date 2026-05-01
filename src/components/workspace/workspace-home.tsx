"use client";

import { FileText } from "lucide-react";
import { ArticleSidebar } from "./article-sidebar";
import { ArticleCard } from "@/components/dashboard/article-card";
import { useSidebar } from "./sidebar-context";
import { NewArticleFab } from "@/components/shared/new-article-fab";
import type { WorkspaceArticle } from "@/app/workspace/page";

interface WorkspaceHomeProps {
  articles: WorkspaceArticle[];
}

export function WorkspaceHome({ articles }: WorkspaceHomeProps) {
  const { width: sidebarWidth } = useSidebar();

  return (
    <div className="h-screen flex bg-surface-card">
      <ArticleSidebar />
      <div
        className="flex-1 flex flex-col h-full transition-[margin-left] duration-300 ease-in-out overflow-y-auto bg-surface-card"
        style={{ marginLeft: sidebarWidth }}
      >
        <div
          className={`bg-surface-card flex-1 p-4 md:p-8 md:px-10 flex flex-col gap-6 max-w-[1024px] mx-auto w-full ${sidebarWidth === 0 ? "pt-10" : ""}`}
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary tracking-[-0.5px]">
              Workspace
            </h1>
            <p className="text-sm text-text-secondary">
              Select an article to continue writing
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <FileText
                size={48}
                className="text-text-muted"
                strokeWidth={1.5}
              />
              <span className="text-xl font-semibold text-text-primary">
                Create your first article
              </span>
              <span className="text-sm text-text-secondary">
                Paste material, write instructions, and generate drafts.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase">
                Recent Articles
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.slug}
                    slug={article.slug}
                    title={article.title}
                    createdAt={article.createdAt}
                    versionCount={article.versionCount}
                    activeNode={article.activeNode}
                    preview={article.preview}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <NewArticleFab />
    </div>
  );
}

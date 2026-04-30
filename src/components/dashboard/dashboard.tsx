"use client";

import { useRouter } from "next/navigation";
import { FileText, Pencil, CircleCheck } from "lucide-react";
import { ArticleCard } from "./article-card";
import { DashboardEmpty } from "./dashboard-empty";
import { useSidebar } from "@/components/workspace/sidebar-context";
import { ArticleSidebar } from "@/components/workspace/article-sidebar";
import { NewArticleFab } from "@/components/shared/new-article-fab";

interface ArticleCardData {
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  activeNode: string | null;
  preview: string;
}

interface DashboardProps {
  articles: ArticleCardData[];
}

const stats = [
  { label: "Total Articles", icon: FileText, colorClass: "text-text-primary" },
  { label: "In Progress", icon: Pencil, colorClass: "text-brand-accent" },
  { label: "Promoted", icon: CircleCheck, colorClass: "text-success" },
] as const;

export function Dashboard({ articles }: DashboardProps) {
  const { width: sidebarWidth } = useSidebar();
  const router = useRouter();

  const counts = [articles.length, 0, 0];

  if (articles.length === 0) {
    return (
      <div className="h-screen flex bg-surface-card">
        <ArticleSidebar />
        <div
          className="flex-1 flex flex-col h-full transition-[margin-left] duration-300 ease-in-out"
          style={{ marginLeft: sidebarWidth }}
        >
          <DashboardEmpty />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-surface-card">
      <ArticleSidebar />
      <div
        className="flex-1 flex flex-col h-full transition-[margin-left] duration-300 ease-in-out overflow-y-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className={`bg-surface-card flex-1 p-4 md:p-8 md:px-10 flex flex-col gap-6 md:gap-8 max-w-[1024px] mx-auto w-full ${sidebarWidth === 0 ? "pt-14" : ""}`}>
          {/* Page header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary tracking-[-0.5px]">
              Dashboard
            </h1>
            <p className="text-sm text-text-secondary">
              Manage your articles and track writing progress
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="w-[140px] flex flex-col gap-2 rounded-card border border-border-default bg-surface-card p-4 px-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] hover:scale-[1.02] transition-[shadow,transform]"
                >
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className="text-text-muted" />
                    <span className="text-xs font-medium text-text-muted">
                      {stat.label}
                    </span>
                  </div>
                  <span className={`text-[28px] font-bold ${stat.colorClass}`}>
                    {counts[i]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Section header */}
          <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px]">
            Recent Articles
          </h2>

          {/* Card grid */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        </div>
      </div>
      <NewArticleFab />
    </div>
  );
}

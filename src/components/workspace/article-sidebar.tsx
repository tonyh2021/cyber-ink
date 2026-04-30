"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  Palette,
  PanelLeftClose,
  Moon,
  Sun,
  Plus,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSidebar } from "./sidebar-context";

interface ArticleSidebarProps {
  currentSlug?: string;
}

export function ArticleSidebar({ currentSlug }: ArticleSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { collapsed, setCollapsed, articles, refreshArticles } = useSidebar();
  const [isCreating, setIsCreating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  async function handleDelete(slug: string) {
    const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    if (res.ok) {
      await refreshArticles();
      if (slug === currentSlug) {
        const remaining = articles.filter((a) => a.slug !== slug);
        if (remaining.length > 0) {
          router.push(`/workspace/${remaining[0].slug}`);
        } else {
          router.push("/workspace");
        }
      }
    }
    setDeleteSlug(null);
  }

  const isDark = resolvedTheme === "dark";

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/", active: pathname === "/" },
    { name: "Workspace", icon: PenLine, href: "/workspace", active: pathname.startsWith("/workspace") },
    { name: "Styles", icon: Palette, href: "/styles", active: pathname === "/styles" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-surface-root flex flex-col z-40 shadow-[0_3px_16px_rgba(0,0,0,0.08)] transition-[width,padding] duration-300 ease-in-out overflow-hidden ${
        collapsed ? "w-14 items-center py-5 px-0" : "w-[220px] py-5 px-3"
      }`}
    >
      {/* Logo row */}
      <div
        className={`flex items-center shrink-0 ${
          collapsed ? "justify-center w-full" : "justify-between px-2"
        }`}
      >
        <button
          onClick={() => collapsed && setCollapsed(false)}
          className="text-lg font-extrabold text-brand-accent whitespace-nowrap"
          style={{ letterSpacing: "-0.5px" }}
        >
          {collapsed ? "CI" : "CyberInk"}
        </button>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-text-muted hover:text-text-secondary shrink-0"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Spacer between logo and nav */}
      <div className="h-6 shrink-0" />

      {/* Nav links */}
      <nav className={`flex flex-col shrink-0 ${collapsed ? "items-center gap-2" : "gap-0.5"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              title={collapsed ? item.name : undefined}
              className={
                collapsed
                  ? `flex items-center justify-center w-8 h-8 rounded-standard transition-colors ${
                      item.active
                        ? "bg-brand-accent-dim text-brand-accent"
                        : "text-text-muted hover:text-text-secondary"
                    }`
                  : `flex items-center gap-2.5 rounded-standard px-3 py-2 text-sm transition-colors ${
                      item.active
                        ? "bg-brand-accent-dim text-brand-accent font-semibold"
                        : "text-text-secondary font-medium hover:bg-surface-elevated"
                    }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Spacer between nav and articles */}
      <div className="h-6 shrink-0" />

      {/* Articles section — hidden when collapsed */}
      {!collapsed && (
        <div className="flex flex-col gap-2 flex-1 min-h-0">
          <span className="text-[11px] font-semibold text-text-muted tracking-wider uppercase px-3">
            Articles
          </span>
          <div className="flex flex-col gap-1 overflow-y-auto flex-1">
            {articles.length === 0 && (
              <span className="text-[13px] text-text-muted px-3">No articles yet</span>
            )}
            {articles.map((article) => {
              const isSelected = article.slug === currentSlug;
              const versionText =
                article.versionCount === 0
                  ? "No versions"
                  : article.activeNode
                    ? `${article.versionCount} version${article.versionCount > 1 ? "s" : ""} · active: ${article.activeNode}`
                    : `${article.versionCount} version${article.versionCount > 1 ? "s" : ""}`;

              return (
                <div
                  key={article.slug}
                  className={`group relative flex items-start rounded-standard px-3 py-2 transition-colors ${
                    isSelected ? "bg-brand-accent-dim" : "hover:bg-surface-elevated"
                  }`}
                >
                  <button
                    onClick={() => router.push(`/workspace/${article.slug}`)}
                    className="flex flex-col gap-1 text-left flex-1 min-w-0"
                  >
                    <span
                      className={`text-[13px] truncate w-full ${
                        isSelected
                          ? "font-semibold text-brand-accent"
                          : "font-normal text-text-primary"
                      }`}
                    >
                      {article.title}
                    </span>
                    <span
                      className={`text-[11px] ${
                        isSelected ? "text-brand-accent" : "text-text-secondary"
                      }`}
                    >
                      {versionText}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteSlug(article.slug);
                    }}
                    className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 p-1 text-text-muted hover:text-danger transition-opacity"
                    title="Delete article"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer when collapsed (replaces articles) */}
      {collapsed && <div className="flex-1" />}

      {/* Bottom section */}
      <div className={`flex flex-col shrink-0 ${collapsed ? "items-center gap-3" : "gap-3"}`}>
        {collapsed ? (
          <button
            onClick={handleCreate}
            disabled={isCreating}
            title="New Article"
            className="flex items-center justify-center w-8 h-8 rounded-standard bg-brand-accent text-white hover:bg-brand-accent-hover disabled:opacity-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full flex items-center justify-center rounded-standard bg-brand-accent py-2 px-5 text-sm font-bold text-white hover:bg-brand-accent-hover disabled:opacity-50 transition-colors"
          >
            {isCreating ? "Creating..." : "New Article"}
          </button>
        )}

        {collapsed ? (
          <button
            onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
            className="text-text-muted hover:text-text-secondary h-4"
            title={mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}
          >
            {mounted && (isDark ? <Sun size={16} /> : <Moon size={16} />)}
          </button>
        ) : (
          <div className="flex items-center justify-between px-2 h-5">
            <span className="text-xs text-text-muted">
              {mounted ? (isDark ? "Dark mode" : "Light mode") : " "}
            </span>
            <button
              onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
              className="text-text-muted hover:text-text-secondary"
            >
              {mounted && (isDark ? <Moon size={16} /> : <Sun size={16} />)}
            </button>
          </div>
        )}
      </div>
      {/* Delete confirmation dialog */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-surface-card rounded-modal p-6 shadow-[var(--shadow-modal)] w-80 flex flex-col gap-4">
            <h3 className="text-base font-semibold text-text-primary">
              Delete article?
            </h3>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              This will permanently remove this article and all its versions.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteSlug(null)}
                className="px-4 py-1.5 text-sm font-medium text-text-secondary rounded-standard hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteSlug)}
                className="px-4 py-1.5 text-sm font-medium text-text-on-accent bg-danger rounded-standard hover:opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

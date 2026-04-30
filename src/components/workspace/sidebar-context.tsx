"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface ArticleSummary {
  slug: string;
  title: string;
  versionCount: number;
  activeNode: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  width: number;
  articles: ArticleSummary[];
  refreshArticles: () => Promise<void>;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  width: 220,
  articles: [],
  refreshArticles: async () => {},
});

interface SidebarProviderProps {
  children: ReactNode;
  initialArticles?: ArticleSummary[];
}

export function SidebarProvider({
  children,
  initialArticles = [],
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [articles, setArticles] = useState<ArticleSummary[]>(initialArticles);
  const width = collapsed ? 56 : 220;

  const refreshArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        setArticles(await res.json());
      }
    } catch {
      // silent
    }
  }, []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, width, articles, refreshArticles }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

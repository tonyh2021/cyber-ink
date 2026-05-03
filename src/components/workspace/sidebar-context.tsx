"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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
  collapsed: true,
  setCollapsed: () => {},
  width: 56,
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
  const [userToggled, setUserToggled] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [articles, setArticles] = useState<ArticleSummary[]>(initialArticles);
  const width = collapsed ? (isNarrow ? 0 : 56) : 220;

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");

    function syncFromMql() {
      const narrow = !mql.matches;
      setIsNarrow(narrow);
      if (narrow) setCollapsed(true);
    }

    queueMicrotask(syncFromMql);

    function handleChange(e: MediaQueryListEvent) {
      const narrow = !e.matches;
      setIsNarrow(narrow);
      if (!userToggled) setCollapsed(narrow);
    }
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, [userToggled]);

  const handleSetCollapsed = useCallback((v: boolean) => {
    setUserToggled(true);
    setCollapsed(v);
  }, []);

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
      value={{
        collapsed,
        setCollapsed: handleSetCollapsed,
        width,
        articles,
        refreshArticles,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

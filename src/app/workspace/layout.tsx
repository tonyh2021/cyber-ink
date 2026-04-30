import { SidebarProvider } from "@/components/workspace/sidebar-context";
import { listDirs, readJson } from "@/lib/data";
import type { ArticleMeta, ArticleTree } from "@/types";

async function getArticles() {
  let slugs: string[] = [];
  try {
    slugs = await listDirs("articles");
  } catch {
    return [];
  }

  const summaries = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const meta = await readJson<ArticleMeta>(`articles/${slug}/meta.json`);
        const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);
        return {
          slug: meta.slug,
          title: meta.title,
          versionCount: Object.keys(tree.nodes).length,
          activeNode: tree.latestNode,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt,
        };
      } catch {
        return null;
      }
    })
  );

  return summaries
    .filter((s) => s !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const articles = await getArticles();
  return <SidebarProvider initialArticles={articles}>{children}</SidebarProvider>;
}

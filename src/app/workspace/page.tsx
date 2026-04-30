import { listDirs, readJson, readMarkdown } from "@/lib/data";
import type { ArticleMeta, ArticleTree } from "@/types";
import { WorkspaceHome } from "@/components/workspace/workspace-home";

export interface WorkspaceArticle {
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  versionCount: number;
  activeNode: string | null;
  preview: string;
}

export default async function WorkspacePage() {
  let slugs: string[] = [];
  try {
    slugs = await listDirs("articles");
  } catch {
    // no articles directory yet
  }

  const articles: WorkspaceArticle[] = [];
  for (const slug of slugs) {
    try {
      const meta = await readJson<ArticleMeta>(`articles/${slug}/meta.json`);
      const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);

      let preview = "";
      if (tree.latestNode) {
        try {
          const { content } = await readMarkdown(
            `articles/${slug}/nodes/${tree.latestNode}.md`
          );
          preview = content.slice(0, 200);
        } catch {
          // no content
        }
      }

      articles.push({
        slug: meta.slug,
        title: meta.title,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
        versionCount: Object.keys(tree.nodes).length,
        activeNode: tree.latestNode,
        preview,
      });
    } catch {
      // skip
    }
  }

  articles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return <WorkspaceHome articles={articles} />;
}

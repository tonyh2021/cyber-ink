import { listDirs, readJson, readMarkdown } from "@/lib/data";
import type { ArticleMeta, ArticleTree } from "@/types";
import { Dashboard } from "@/components/dashboard/dashboard";

async function getArticlesWithPreview() {
  let slugs: string[] = [];
  try {
    slugs = await listDirs("articles");
  } catch {
    return [];
  }

  const articles = await Promise.all(
    slugs.map(async (slug) => {
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

        return {
          slug: meta.slug,
          title: meta.title,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt,
          versionCount: Object.keys(tree.nodes).length,
          activeNode: tree.latestNode,
          preview,
        };
      } catch {
        return null;
      }
    })
  );

  return articles
    .filter((a) => a !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export default async function DashboardPage() {
  const articles = await getArticlesWithPreview();
  return <Dashboard articles={articles} />;
}

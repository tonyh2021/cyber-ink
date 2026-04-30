import { redirect } from "next/navigation";
import { listDirs, readJson } from "@/lib/data";
import type { ArticleMeta } from "@/types";

export default async function WorkspacePage() {
  let slugs: string[] = [];
  try {
    slugs = await listDirs("articles");
  } catch {
    // no articles directory yet
  }

  if (slugs.length > 0) {
    const metas = await Promise.all(
      slugs.map(async (slug) => {
        try {
          return await readJson<ArticleMeta>(`articles/${slug}/meta.json`);
        } catch {
          return null;
        }
      })
    );
    const sorted = metas
      .filter((m) => m !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    if (sorted.length > 0) {
      redirect(`/workspace/${sorted[0].slug}`);
    }
  }

  // No articles — show empty state as client component
  const { WorkspaceEmpty } = await import(
    "@/components/workspace/workspace-empty"
  );
  return <WorkspaceEmpty />;
}

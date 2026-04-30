import { NextRequest, NextResponse } from "next/server";
import {
  ensureDir,
  writeJson,
  writeMarkdown,
  listDirs,
  readJson,
} from "@/lib/data";
import { CreateArticleInputSchema } from "@/types";
import type { ArticleMeta, ArticleTree, ArticleSummary } from "@/types";


function generateSlug(existingSlugs: string[]): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `art-${dateStr}-`;
  let counter = 1;
  for (const s of existingSlugs) {
    if (s.startsWith(prefix)) {
      const n = parseInt(s.slice(prefix.length), 10);
      if (!isNaN(n) && n >= counter) counter = n + 1;
    }
  }
  return `${prefix}${String(counter).padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateArticleInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Title and language are required" },
      { status: 400 }
    );
  }

  const { title, language } = parsed.data;

  await ensureDir("articles");
  const existingSlugs = await listDirs("articles");
  const slug = generateSlug(existingSlugs);
  const now = new Date().toISOString();

  const meta: ArticleMeta = {
    title,
    slug,
    language,
    status: "draft",
    styleRef: null,
    styleVersion: "v1",
    createdAt: now,
    updatedAt: now,
  };

  const emptyTree: ArticleTree = {
    rootNode: null,
    bestNode: null,
    latestNode: null,
    nodes: {},
  };

  await ensureDir(`articles/${slug}`);
  await ensureDir(`articles/${slug}/nodes`);
  await ensureDir(`articles/${slug}/evaluation`);
  await writeJson(`articles/${slug}/meta.json`, meta);
  await writeJson(`articles/${slug}/tree.json`, emptyTree);
  await writeMarkdown(`articles/${slug}/source.md`, {}, "");

  return NextResponse.json({ slug }, { status: 201 });
}

export async function GET() {
  await ensureDir("articles");
  const slugs = await listDirs("articles");

  const summaries = await Promise.all(
    slugs.map(async (slug) => {
      try {
        const meta = await readJson<ArticleMeta>(`articles/${slug}/meta.json`);
        const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);
        const versionCount = Object.keys(tree.nodes).length;
        const summary: ArticleSummary = {
          slug: meta.slug,
          title: meta.title,
          language: meta.language,
          createdAt: meta.createdAt,
          updatedAt: meta.updatedAt,
          versionCount,
          activeNode: tree.latestNode,
        };
        return summary;
      } catch {
        return null;
      }
    })
  );

  const filtered = summaries
    .filter((s) => s !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json(filtered);
}

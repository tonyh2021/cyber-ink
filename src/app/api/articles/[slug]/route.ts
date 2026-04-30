import { NextRequest, NextResponse } from "next/server";
import { exists, removeDir, readJson, readMarkdown, listFiles } from "@/lib/data";
import type { ArticleMeta, ArticleTree } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const articleExists = await exists(`articles/${slug}/meta.json`);
  if (!articleExists) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const meta = await readJson<ArticleMeta>(`articles/${slug}/meta.json`);
  const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);

  const nodeFiles = await listFiles(`articles/${slug}/nodes`, ".md");
  const nodes: Record<string, { frontmatter: Record<string, unknown>; content: string }> = {};
  for (const file of nodeFiles) {
    const nodeName = file.replace(".md", "");
    const { frontmatter, content } = await readMarkdown(`articles/${slug}/nodes/${file}`);
    nodes[nodeName] = { frontmatter, content };
  }

  const evalFiles = await listFiles(`articles/${slug}/evaluation`, ".json");
  const evaluations: Record<string, unknown> = {};
  for (const file of evalFiles) {
    const name = file.replace(".json", "");
    evaluations[name] = await readJson(`articles/${slug}/evaluation/${file}`);
  }

  return NextResponse.json({ meta, tree, nodes, evaluations });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const articleExists = await exists(`articles/${slug}/meta.json`);
  if (!articleExists) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await removeDir(`articles/${slug}`);
  return new NextResponse(null, { status: 204 });
}

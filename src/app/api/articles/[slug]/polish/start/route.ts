import { NextRequest, NextResponse } from "next/server";
import { readJson, exists } from "@/lib/data";
import { initPolishSession } from "@/lib/polish-data";
import type { ArticleTree } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!(await exists(`articles/${slug}/meta.json`))) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  let body: { node?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const node = body.node;
  if (!node) {
    return NextResponse.json({ error: "Missing node" }, { status: 400 });
  }

  const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);
  if (!tree.nodes[node]) {
    return NextResponse.json({ error: "Node not found" }, { status: 404 });
  }

  try {
    await initPolishSession(slug, node);
  } catch {
    return NextResponse.json(
      { error: "Polish session already active" },
      { status: 409 },
    );
  }

  return NextResponse.json({ status: "started", node });
}

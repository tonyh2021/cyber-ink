import { NextRequest, NextResponse } from "next/server";
import { exists, writeJson, listFiles, ensureDir } from "@/lib/data";
import type { ArticleTree } from "@/types";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const articleExists = await exists(`articles/${slug}/tree.json`);
  if (!articleExists) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const nodeFiles = await listFiles(`articles/${slug}/nodes`, ".md");
  for (const file of nodeFiles) {
    await fs.unlink(path.join(DATA_DIR, `articles/${slug}/nodes/${file}`));
  }

  const emptyTree: ArticleTree = {
    rootNode: null,
    bestNode: null,
    latestNode: null,
    nodes: {},
  };
  await writeJson(`articles/${slug}/tree.json`, emptyTree);
  await ensureDir(`articles/${slug}/nodes`);

  return NextResponse.json({ ok: true });
}

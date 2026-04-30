import { NextRequest, NextResponse } from "next/server";
import { exists } from "@/lib/data";
import { discardPolish } from "@/lib/polish-data";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!(await exists(`articles/${slug}/meta.json`))) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await discardPolish(slug);
  return NextResponse.json({ discarded: true });
}

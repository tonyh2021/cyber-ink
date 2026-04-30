import { NextRequest, NextResponse } from "next/server";
import { exists } from "@/lib/data";
import { getPolishStatus } from "@/lib/polish-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!(await exists(`articles/${slug}/meta.json`))) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const status = await getPolishStatus(slug);
  return NextResponse.json(status);
}

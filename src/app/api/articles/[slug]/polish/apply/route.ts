import { NextRequest, NextResponse } from "next/server";
import { exists } from "@/lib/data";
import { getPolishStatus, applyPolish } from "@/lib/polish-data";
import type { PolishApplyChoice } from "@/types";

const VALID_PICKS = new Set<PolishApplyChoice>(["original", "previous", "current"]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!(await exists(`articles/${slug}/meta.json`))) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  let body: { pick?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pick = body.pick as PolishApplyChoice;
  if (!VALID_PICKS.has(pick)) {
    return NextResponse.json({ error: "Invalid pick" }, { status: 400 });
  }

  const status = await getPolishStatus(slug);
  if (!status.active) {
    return NextResponse.json(
      { error: "No active polish session" },
      { status: 400 },
    );
  }

  if (pick === "previous" && status.rounds.length < 2) {
    return NextResponse.json(
      { error: "No previous round exists" },
      { status: 400 },
    );
  }

  try {
    const node = await applyPolish(slug, pick);
    return NextResponse.json({ applied: true, node });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apply failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

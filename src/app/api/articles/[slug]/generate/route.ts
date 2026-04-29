import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { getConfig } from "@/lib/config";
import { readMarkdown, readJson, writeMarkdown, writeJson, exists } from "@/lib/data";
import { buildPrompt } from "@/lib/prompt-builder";
import { GenerateInputSchema } from "@/types";
import type { ArticleTree } from "@/types";

function getModel(provider: string, model: string) {
  if (provider === "anthropic") {
    return createAnthropic()(model);
  }
  if (provider === "openai") {
    return createOpenAI()(model);
  }
  throw new Error(`Unknown provider: ${provider}`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const articleExists = await exists(`articles/${slug}/source.md`);
  if (!articleExists) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = GenerateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid instruction" },
      { status: 400 }
    );
  }

  const { instruction } = parsed.data;

  const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);
  if (tree.rootNode) {
    return NextResponse.json(
      { error: "Article already has a root node. Generation is one-shot in Phase 1." },
      { status: 409 }
    );
  }

  const config = await getConfig();
  const { content: profileContent } = await readMarkdown("profiles/default.md");

  const stylePath = "styles/default/active.md";
  const { content: styleContent } = await readMarkdown(stylePath);

  const { content: sourceContent } = await readMarkdown(`articles/${slug}/source.md`);

  const { systemPrompt, userMessage } = buildPrompt({
    profile: profileContent,
    style: styleContent,
    source: sourceContent,
    instruction,
    language: config.language,
  });

  const model = getModel(
    config.models.writing.provider,
    config.models.writing.model
  );

  const result = streamText({
    model,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    async onFinish({ text, usage }) {
      console.log(`[generate] ${slug} | tokens: ${usage.inputTokens} input + ${usage.outputTokens} output = ${(usage.inputTokens ?? 0) + (usage.outputTokens ?? 0)} total`);
      await writeMarkdown(`articles/${slug}/nodes/v1.md`, {
        node: "v1",
        generatedAt: new Date().toISOString(),
      }, text);

      const updatedTree: ArticleTree = {
        rootNode: "v1",
        bestNode: null,
        latestNode: "v1",
        nodes: {
          v1: { parent: null, depth: 1, children: [] },
        },
      };
      await writeJson(`articles/${slug}/tree.json`, updatedTree);
    },
  });

  return result.toTextStreamResponse();
}

import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { getConfig } from "@/lib/config";
import {
  readMarkdown,
  readJson,
  writeMarkdown,
  writeJson,
  exists,
} from "@/lib/data";
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

function nextNodeName(tree: ArticleTree): string {
  const existing = Object.keys(tree.nodes)
    .filter((n) => /^v\d+$/.test(n))
    .map((n) => parseInt(n.slice(1), 10));
  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `v${max + 1}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const articleExists = await exists(`articles/${slug}/meta.json`);
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

  const { instruction, source } = parsed.data;

  if (source !== undefined) {
    await writeMarkdown(`articles/${slug}/source.md`, {}, source);
  }

  const tree = await readJson<ArticleTree>(`articles/${slug}/tree.json`);
  const nodeName = nextNodeName(tree);

  const config = await getConfig();
  const { content: profileContent } = await readMarkdown("profiles/default.md");
  const { content: styleContent } = await readMarkdown(
    "styles/default/active.md"
  );
  const { content: sourceContent } = await readMarkdown(
    `articles/${slug}/source.md`
  );

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
      console.log(
        `[generate] ${slug}/${nodeName} | tokens: ${usage.inputTokens} in + ${usage.outputTokens} out`
      );
      await writeMarkdown(
        `articles/${slug}/nodes/${nodeName}.md`,
        {
          node: nodeName,
          generatedAt: new Date().toISOString(),
          instruction,
        },
        text
      );

      const updatedTree: ArticleTree = {
        rootNode: tree.rootNode || nodeName,
        bestNode: tree.bestNode,
        latestNode: nodeName,
        nodes: {
          ...tree.nodes,
          [nodeName]: { parent: null, depth: 1, children: [] },
        },
      };
      await writeJson(`articles/${slug}/tree.json`, updatedTree);
    },
  });

  return result.toTextStreamResponse();
}

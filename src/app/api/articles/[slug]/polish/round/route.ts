import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { getConfig } from "@/lib/config";
import { readMarkdown, exists, updateArticleTitle } from "@/lib/data";
import { buildPolishPrompt } from "@/lib/prompt-builder";
import {
  getPolishStatus,
  savePolishRound,
  appendPolishHistory,
} from "@/lib/polish-data";

function getModel(provider: string, model: string) {
  if (provider === "anthropic") {
    return createAnthropic()(model);
  }
  if (provider === "openai") {
    return createOpenAI()(model);
  }
  throw new Error(`Unknown provider: ${provider}`);
}

function parsePolishOutput(text: string): { summary: string; article: string } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text.trim());
  if (match) {
    return { summary: match[1].trim(), article: match[2].trim() };
  }
  return { summary: "", article: text.trim() };
}

function buildMockPolishOutput(instruction: string, original: string): string {
  const summaryLine = `Applied polish: ${instruction.slice(0, 80)}`;
  return [
    "---",
    summaryLine,
    "---",
    original,
  ].join("\n");
}

function createMockStreamResponse(
  text: string,
  onComplete: () => Promise<void>,
): Response {
  const encoder = new TextEncoder();
  let cancelled = false;
  const chunkSize = 24;
  const chunkDelayMs = 100;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let index = 0; index < text.length; index += chunkSize) {
          if (cancelled) return;
          const chunk = text.slice(index, index + chunkSize);
          controller.enqueue(encoder.encode(chunk));
          await new Promise((resolve) => setTimeout(resolve, chunkDelayMs));
        }
        if (!cancelled) {
          await onComplete();
          controller.close();
        }
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      cancelled = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!(await exists(`articles/${slug}/meta.json`))) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  let body: { instruction?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.instruction?.trim()) {
    return NextResponse.json(
      { error: "Missing instruction" },
      { status: 400 },
    );
  }
  const instruction: string = body.instruction.trim();

  const status = await getPolishStatus(slug);
  if (!status.active) {
    return NextResponse.json(
      { error: "No active polish session" },
      { status: 400 },
    );
  }

  let polishPromptConfig = "";
  try {
    const { content } = await readMarkdown("instruction/polish-prompt.md");
    polishPromptConfig = content;
  } catch {
    // no config file — hardcoded rules suffice
  }

  const { systemPrompt, messages } = buildPolishPrompt({
    original: status.original,
    history: status.history,
    currentInstruction: instruction,
    polishPromptConfig,
  });

  const config = await getConfig();

  async function persistRound(text: string): Promise<void> {
    const { summary, article } = parsePolishOutput(text);
    await savePolishRound(slug, article);
    await appendPolishHistory(slug, [
      { role: "user", content: instruction },
      { role: "assistant", content: article, summary },
    ]);
    await updateArticleTitle(slug, article);
  }

  if (config.models.writing.provider === "mock") {
    const mockText = buildMockPolishOutput(instruction, status.original);
    return createMockStreamResponse(mockText, () => persistRound(mockText));
  }

  const model = getModel(
    config.models.writing.provider,
    config.models.writing.model,
  );

  const result = streamText({
    model,
    system: systemPrompt,
    messages,
    async onFinish({ text, usage }) {
      console.log(
        `[polish] ${slug} | tokens: ${usage.inputTokens} in + ${usage.outputTokens} out`,
      );
      await persistRound(text);
    },
  });

  return result.toTextStreamResponse();
}

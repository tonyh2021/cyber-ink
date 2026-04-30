import { readJson, readMarkdown, listFiles } from "@/lib/data";
import { exists } from "@/lib/data";
import { notFound } from "next/navigation";
import { Workspace } from "@/components/workspace/workspace";
import type { ArticleMeta } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function compareNodeFileNames(a: string, b: string): number {
  const aName = a.replace(".md", "");
  const bName = b.replace(".md", "");
  const aMatch = /^v(\d+)$/.exec(aName);
  const bMatch = /^v(\d+)$/.exec(bName);

  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  }

  return aName.localeCompare(bName);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const articleExists = await exists(`articles/${slug}/meta.json`);
  if (!articleExists) notFound();

  const meta = await readJson<ArticleMeta>(`articles/${slug}/meta.json`);

  let sourceContent = "";
  try {
    const { content } = await readMarkdown(`articles/${slug}/source.md`);
    sourceContent = content;
  } catch {
    // empty source
  }

  const nodeFiles = await listFiles(`articles/${slug}/nodes`, ".md");
  const nodes: { node: string; instruction?: string }[] = [];
  const nodeContent: Record<string, string> = {};

  for (const file of nodeFiles.sort(compareNodeFileNames)) {
    const nodeName = file.replace(".md", "");
    const { frontmatter, content } = await readMarkdown(
      `articles/${slug}/nodes/${file}`,
    );
    nodes.push({
      node: nodeName,
      instruction: (frontmatter.instruction as string) || undefined,
    });
    nodeContent[nodeName] = content;
  }

  return (
    <Workspace
      slug={slug}
      title={meta.title}
      createdAt={meta.createdAt}
      initialSource={sourceContent}
      initialNodes={nodes}
      initialContent={nodeContent}
    />
  );
}

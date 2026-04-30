"use client";

import {
  memo,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
} from "react";
import ReactMarkdown, {
  type Components,
  type ExtraProps,
} from "react-markdown";
import { useStreamBuffer } from "@/hooks/use-stream-buffer";

interface OutputStreamProps {
  content: string;
  isLoading?: boolean;
}

// --- Element-level memoization (from assistant-ui pattern) ---
// Each markdown element is memo'd by comparing its HAST node.
// Even when ReactMarkdown re-parses the full string, unchanged
// elements skip re-render.

type MdComponentProps = PropsWithChildren<HTMLAttributes<HTMLElement>> &
  ExtraProps;

function memoMdComponent(Tag: string): FC<MdComponentProps> {
  const Component: FC<MdComponentProps> = ({ ...props }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const El = Tag as any;
    return <El {...props} />;
  };
  Component.displayName = `Md.${Tag}`;

  return memo(Component, (prev, next) => {
    if (!prev.node || !next.node) return false;
    const strip = (properties: Record<string, unknown>) => {
      const sanitized = { ...properties };
      delete sanitized.position;
      delete sanitized.data;
      return sanitized;
    };
    return (
      JSON.stringify(strip(prev.node.properties as Record<string, unknown>)) ===
        JSON.stringify(
          strip(next.node.properties as Record<string, unknown>),
        ) &&
      JSON.stringify(prev.node.children) === JSON.stringify(next.node.children)
    );
  });
}

const markdownComponents: Components = Object.fromEntries(
  [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "hr",
    "a",
    "strong",
    "em",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ].map((tag) => [tag, memoMdComponent(tag)]),
);

// --- Paragraph-boundary split (kept — avoids full re-parse of frozen content) ---

function splitAtParagraphBoundary(text: string): [string, string] {
  let inCodeBlock = false;
  let lastSplitIndex = -1;
  let i = 0;

  while (i < text.length) {
    if (
      text[i] === "`" &&
      i + 2 < text.length &&
      text[i + 1] === "`" &&
      text[i + 2] === "`"
    ) {
      inCodeBlock = !inCodeBlock;
      i += 3;
      continue;
    }

    if (
      !inCodeBlock &&
      text[i] === "\n" &&
      i + 1 < text.length &&
      text[i + 1] === "\n"
    ) {
      lastSplitIndex = i + 2;
      i += 2;
      continue;
    }

    i++;
  }

  if (lastSplitIndex <= 0) {
    return ["", text];
  }

  return [text.slice(0, lastSplitIndex), text.slice(lastSplitIndex)];
}

// --- Frozen markdown (paragraph-level memo — skips re-parse entirely) ---

const FrozenMarkdown = memo(function FrozenMarkdown({
  content,
}: {
  content: string;
}) {
  return (
    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
  );
});

// --- Main component ---

export function OutputStream({ content, isLoading }: OutputStreamProps) {
  const { displayedText, isBuffering } = useStreamBuffer(
    content,
    isLoading ?? false,
  );

  if (!displayedText && !isLoading) return null;

  const [frozen, tail] = splitAtParagraphBoundary(displayedText);
  const streaming = isLoading || isBuffering;

  return (
    <div
      className="output-stream font-mono text-sm leading-[1.8] text-text-primary prose prose-invert max-w-none prose-headings:font-mono prose-headings:font-bold prose-headings:text-brand-accent prose-headings:tracking-wide prose-headings:scroll-mt-4 prose-headings:mt-7 prose-headings:mb-3 prose-headings:border-b prose-headings:border-border-default prose-headings:pb-2 prose-p:text-text-primary prose-p:my-3 prose-strong:text-text-primary prose-li:text-text-primary"
      data-streaming={streaming || undefined}
    >
      {frozen && <FrozenMarkdown content={frozen} />}
      {tail && (
        <ReactMarkdown components={markdownComponents}>{tail}</ReactMarkdown>
      )}
    </div>
  );
}

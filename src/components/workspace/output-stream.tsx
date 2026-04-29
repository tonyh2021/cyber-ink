"use client";

import ReactMarkdown from "react-markdown";

interface OutputStreamProps {
  content: string;
  isLoading?: boolean;
}

export function OutputStream({ content, isLoading }: OutputStreamProps) {
  if (!content && !isLoading) return null;

  return (
    <div className="bg-surface-canvas border border-border-default rounded-card p-8 md:px-10">
      <div className="font-mono text-sm leading-[1.8] text-text-primary prose prose-invert max-w-none prose-headings:font-mono prose-headings:text-text-primary prose-p:text-text-primary prose-strong:text-text-primary prose-li:text-text-primary">
        <ReactMarkdown>{content}</ReactMarkdown>
        {isLoading && (
          <span className="inline-block w-[2px] h-[1.2em] bg-brand-accent animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    </div>
  );
}

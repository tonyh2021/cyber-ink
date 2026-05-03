"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "@/components/workspace/sidebar-context";
import { ArticleSidebar } from "@/components/workspace/article-sidebar";
import { NewArticleFab } from "@/components/shared/new-article-fab";

interface ReferenceArticle {
  name: string;
  filename: string;
  content: string;
}

interface ReferenceGroup {
  name: string;
  references: ReferenceArticle[];
}

interface ProfileData {
  name: string;
  description: string;
  content: string;
}

interface StylesPageProps {
  instruction: string;
  profile: ProfileData;
  references: ReferenceGroup[];
}

function ReferenceCard({ filename, content }: ReferenceArticle) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.slice(0, 150).replace(/\n/g, " ");

  return (
    <div className="rounded-card border border-border-default bg-surface-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-4 text-left"
      >
        {expanded ? (
          <ChevronDown size={14} className="text-text-muted shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-text-muted shrink-0" />
        )}
        <span className="text-[13px] font-medium text-text-primary">
          {filename}
        </span>
        {!expanded && (
          <span className="text-[12px] text-text-muted truncate ml-2">
            {preview}…
          </span>
        )}
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-0">
          <div className="bg-surface-canvas rounded-standard p-4 max-h-[400px] overflow-y-auto">
            <pre className="font-mono text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.slice(0, 120).replace(/\n/g, " ").trim();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px]">
        {title}
      </h2>
      <div className="rounded-card border border-border-default bg-surface-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 p-4 text-left"
        >
          {expanded ? (
            <ChevronDown size={14} className="text-text-muted shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-text-muted shrink-0" />
          )}
          {!expanded && (
            <span className="text-[12px] text-text-muted truncate">
              {preview}…
            </span>
          )}
        </button>
        {expanded && (
          <div className="px-5 pb-5 pt-0">
            <div className="bg-surface-canvas rounded-standard p-4 max-h-[400px] overflow-y-auto">
              <pre className="font-mono text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                {content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function StylesPage({
  instruction,
  profile,
  references,
}: StylesPageProps) {
  const { width: sidebarWidth } = useSidebar();

  return (
    <div className="h-screen flex bg-surface-card">
      <ArticleSidebar />
      <div
        className="flex-1 flex flex-col h-full transition-[margin-left] duration-300 ease-in-out overflow-y-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="bg-surface-card flex-1 p-8 px-10 flex flex-col gap-8 max-w-[1024px] mx-auto w-full">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary tracking-[-0.5px]">
              Styles
            </h1>
            <p className="text-sm text-text-secondary">
              Writing profile and reference articles
            </p>
          </div>

          {/* Profile */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px]">
              Profile
            </h2>
            <div className="rounded-card border border-border-default bg-surface-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-text-primary">
                  {profile.name}
                </span>
              </div>
              {profile.description && (
                <p className="text-[13px] text-text-secondary mb-3">
                  {profile.description}
                </p>
              )}
              <pre className="font-mono text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                {profile.content}
              </pre>
            </div>
          </section>

          {/* Instruction */}
          {instruction && (
            <CollapsibleSection title="Instruction" content={instruction} />
          )}

          {/* References */}
          {references.map((reference) => (
            <section key={reference.name} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px]">
                  References
                </h2>
                <span className="text-[11px] font-mono text-text-muted bg-surface-root px-1.5 py-0.5 rounded">
                  {reference.name}: {reference.references.length} references
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {reference.references.map((reference) => (
                  <ReferenceCard
                    key={reference.filename}
                    name={reference.name}
                    filename={reference.filename}
                    content={reference.content}
                  />
                ))}
              </div>
            </section>
          ))}
          {references.length === 0 && (
            <p className="text-sm text-text-muted">No styles found.</p>
          )}
        </div>
      </div>
      <NewArticleFab />
    </div>
  );
}

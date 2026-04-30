"use client";

import { useSidebar } from "@/components/workspace/sidebar-context";
import { ArticleSidebar } from "@/components/workspace/article-sidebar";

interface StyleData {
  filename: string;
  name: string;
  version: string;
  description: string;
  content: string;
}

interface ProfileData {
  name: string;
  description: string;
  content: string;
}

interface StylesPageProps {
  profile: ProfileData;
  styles: StyleData[];
}

export function StylesPage({ profile, styles }: StylesPageProps) {
  const { width: sidebarWidth } = useSidebar();

  return (
    <div className="h-screen flex bg-surface-root">
      <ArticleSidebar />
      <div
        className="flex-1 flex flex-col h-full transition-[margin-left] duration-300 ease-in-out overflow-y-auto"
        style={{ marginLeft: sidebarWidth }}
      >
        <div className="bg-surface-card flex-1 p-8 px-10 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-text-primary tracking-[-0.5px]">
              Styles
            </h1>
            <p className="text-sm text-text-secondary">
              Writing profile and style configurations
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

          {/* Styles */}
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px]">
              Styles
            </h2>
            <div className="flex flex-col gap-4">
              {styles.map((style) => (
                <div
                  key={style.filename}
                  className="rounded-card border border-border-default bg-surface-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {style.name}
                    </span>
                    {style.version && (
                      <span className="text-[11px] font-mono text-text-muted bg-surface-root px-1.5 py-0.5 rounded">
                        {style.version}
                      </span>
                    )}
                  </div>
                  {style.description && (
                    <p className="text-[13px] text-text-secondary mb-3">
                      {style.description}
                    </p>
                  )}
                  <pre className="font-mono text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                    {style.content}
                  </pre>
                </div>
              ))}
              {styles.length === 0 && (
                <p className="text-sm text-text-muted">No styles found.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

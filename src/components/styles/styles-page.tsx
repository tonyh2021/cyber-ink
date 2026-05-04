"use client";

import matter from "gray-matter";
import { useSidebar } from "@/components/workspace/sidebar-context";
import { ArticleSidebar } from "@/components/workspace/article-sidebar";
import { NewArticleFab } from "@/components/shared/new-article-fab";
import { useStyles } from "@/hooks/use-styles";
import { downloadMd, readFileAsText, openFilePicker } from "./style-file-utils";
import { EditableSection } from "./editable-section";
import { ReferencesSection } from "./references-section";

export function StylesPage() {
  const { styles, updateProfile, updateInstruction, updatePolishPrompt } =
    useStyles();
  const { width: sidebarWidth } = useSidebar();

  function exportProfile() {
    const md = matter.stringify(styles.profile.content, {
      name: styles.profile.name,
      description: styles.profile.description,
    });
    downloadMd("profile.md", md);
  }

  async function importProfile() {
    const files = await openFilePicker(".md", false);
    if (!files || files.length === 0) return;
    const raw = await readFileAsText(files[0]);
    const { data, content } = matter(raw);
    updateProfile({
      name: (data.name as string) || styles.profile.name,
      description: (data.description as string) || styles.profile.description,
      content: content.trim(),
    });
  }

  function exportSection(filename: string, content: string) {
    downloadMd(filename, content);
  }

  async function importSection(onSave: (value: string) => void) {
    const files = await openFilePicker(".md", false);
    if (!files || files.length === 0) return;
    const raw = await readFileAsText(files[0]);
    const { content } = matter(raw);
    onSave(content.trim());
  }

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
              Configure your writing style
            </p>
          </div>

          <EditableSection
            title="Profile"
            value={styles.profile.content}
            onSave={(content) => updateProfile({ ...styles.profile, content })}
            onExport={exportProfile}
            onImport={importProfile}
          />

          <EditableSection
            title="Instruction"
            value={styles.instruction}
            onSave={updateInstruction}
            onExport={() => exportSection("instruction.md", styles.instruction)}
            onImport={() => importSection(updateInstruction)}
          />

          <EditableSection
            title="Polish Prompt"
            value={styles.polishPrompt}
            onSave={updatePolishPrompt}
            onExport={() =>
              exportSection("polish-prompt.md", styles.polishPrompt)
            }
            onImport={() => importSection(updatePolishPrompt)}
          />

          <ReferencesSection />
        </div>
      </div>
      <NewArticleFab />
    </div>
  );
}

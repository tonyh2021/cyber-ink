"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Download,
  Upload,
} from "lucide-react";
import { useStyles } from "@/hooks/use-styles";
import { downloadMd, readFileAsText, openFilePicker } from "./style-file-utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { StoredStyleReferenceArticle } from "@/types";

const textClass =
  "font-mono text-[12px] leading-relaxed text-text-secondary whitespace-pre-wrap";

function ReferenceCard({
  article,
  onEdit,
  onDelete,
  onExport,
}: {
  article: StoredStyleReferenceArticle;
  onEdit: (article: StoredStyleReferenceArticle) => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draftContent, setDraftContent] = useState(article.content);

  return (
    <div className="rounded-card border border-border-default bg-surface-card shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-primary p-4">
          {article.filename}
        </span>
        {!editing && (
          <div className="flex items-center gap-1 pr-3">
            <button
              onClick={onExport}
              className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
              title="Export"
            >
              <Download size={12} />
            </button>
            <button
              onClick={() => {
                setDraftContent(article.content);
                setEditing(true);
              }}
              className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-text-muted hover:text-color-danger rounded transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      <div className="px-4 pb-4 pt-0">
        <div className="relative rounded-standard bg-surface-canvas h-[200px]">
          {editing ? (
            <>
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className={`w-full h-full p-4 pb-12 ${textClass} resize-none bg-transparent outline-none overflow-y-auto`}
                autoFocus
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={() => {
                    setDraftContent(article.content);
                    setEditing(false);
                  }}
                  className="px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary rounded-standard transition-colors bg-surface-card/80 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onEdit({ ...article, content: draftContent });
                    setEditing(false);
                  }}
                  className="px-3 py-1.5 text-[13px] bg-brand-accent text-white rounded-standard hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 h-full overflow-y-auto">
              <pre className={textClass}>{article.content}</pre>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete reference?"
          message={`"${article.filename}" will be permanently removed.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setConfirmDelete(false);
            onDelete();
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

export function ReferencesSection() {
  const { styles, updateReferences } = useStyles();
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");

  const allArticles = styles.references
    .flatMap((group) =>
      group.articles.map((article) => ({
        ...article,
        groupName: group.groupName,
      })),
    )
    .toReversed();

  function handleEdit(
    groupName: string,
    filename: string,
    updated: StoredStyleReferenceArticle,
  ) {
    const newRefs = styles.references.map((group) => {
      if (group.groupName !== groupName) return group;
      return {
        ...group,
        articles: group.articles.map((a) =>
          a.filename === filename ? updated : a,
        ),
      };
    });
    updateReferences(newRefs);
  }

  function handleDelete(groupName: string, filename: string) {
    const newRefs = styles.references
      .map((group) => {
        if (group.groupName !== groupName) return group;
        return {
          ...group,
          articles: group.articles.filter((a) => a.filename !== filename),
        };
      })
      .filter((group) => group.articles.length > 0);
    updateReferences(newRefs);
  }

  async function handleImportReferences() {
    const files = await openFilePicker(".md", true);
    if (!files || files.length === 0) return;

    const defaultGroup = styles.references[0]?.groupName ?? "default";
    const existing = styles.references.find(
      (g) => g.groupName === defaultGroup,
    );
    let nextIndex = existing ? existing.articles.length + 1 : 1;
    const newArticles: StoredStyleReferenceArticle[] = [];

    for (const file of Array.from(files)) {
      const content = await readFileAsText(file);
      newArticles.push({
        name: defaultGroup,
        filename: file.name || `${nextIndex}.md`,
        content: content.trim(),
      });
      nextIndex++;
    }

    if (existing) {
      updateReferences(
        styles.references.map((group) =>
          group.groupName === defaultGroup
            ? { ...group, articles: [...group.articles, ...newArticles] }
            : group,
        ),
      );
    } else {
      updateReferences([
        ...styles.references,
        { groupName: defaultGroup, articles: newArticles },
      ]);
    }
  }

  function handleAdd() {
    if (!newContent.trim()) return;
    const defaultGroup = styles.references[0]?.groupName ?? "default";
    const existing = styles.references.find(
      (g) => g.groupName === defaultGroup,
    );
    const nextIndex = existing ? existing.articles.length + 1 : 1;
    const filename = `${nextIndex}.md`;
    const article: StoredStyleReferenceArticle = {
      name: defaultGroup,
      filename,
      content: newContent.trim(),
    };

    if (existing) {
      updateReferences(
        styles.references.map((group) =>
          group.groupName === defaultGroup
            ? { ...group, articles: [...group.articles, article] }
            : group,
        ),
      );
    } else {
      updateReferences([
        ...styles.references,
        { groupName: defaultGroup, articles: [article] },
      ]);
    }
    setNewContent("");
    setAdding(false);
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-primary tracking-[-0.2px]">
            References
          </h2>
          {allArticles.length > 0 && (
            <span className="text-[11px] font-mono text-text-muted bg-surface-root px-1.5 py-0.5 rounded">
              {allArticles.length} articles
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleImportReferences}
            className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
            title="Import references"
          >
            <Upload size={12} />
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] text-text-muted hover:text-text-primary rounded-standard transition-colors"
          >
            <Plus size={12} />
            Add Reference
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {adding && (
          <div className="rounded-card border border-border-default bg-surface-card shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-4">
            <div className="relative rounded-standard bg-surface-canvas h-[200px]">
              <textarea
                className={`w-full h-full p-4 pb-12 ${textClass} resize-none bg-transparent outline-none overflow-y-auto`}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Paste reference article content..."
                autoFocus
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={() => {
                    setNewContent("");
                    setAdding(false);
                  }}
                  className="px-3 py-1.5 text-[13px] text-text-secondary hover:text-text-primary rounded-standard transition-colors bg-surface-card/80 backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-3 py-1.5 text-[13px] bg-brand-accent text-white rounded-standard hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
        {allArticles.map((article) => (
          <ReferenceCard
            key={`${article.groupName}-${article.filename}`}
            article={article}
            onEdit={(updated) =>
              handleEdit(article.groupName, article.filename, updated)
            }
            onDelete={() => handleDelete(article.groupName, article.filename)}
            onExport={() => downloadMd(article.filename, article.content)}
          />
        ))}
      </div>

      {allArticles.length === 0 && !adding && (
        <p className="text-sm text-text-muted">No references configured.</p>
      )}
    </section>
  );
}

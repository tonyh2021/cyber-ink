# Phase 5 — Diff & Export

## Summary

Implement node-to-node diff comparison and content export (copy Markdown, copy HTML, download .md). These are the final utility features that complete the writing workflow.

## Depends on

- Phase 3 (multiple nodes exist to compare and export)

## Scope

### Diff System

- Uses react-diff-viewer-continued
- Supports comparing content between **any two nodes** in the same article
- User selects two nodes → side-by-side diff view
- Diff rendered in the right panel of the article workspace

### Export System

| Operation | Description |
|-----------|-------------|
| Copy Markdown | Copy selected node's raw Markdown content to clipboard |
| Copy HTML | Render Markdown to HTML, then copy to clipboard |
| Download .md | Download the node content as a `.md` file |

Available on any node (v1, v2-x) and on `final.md`.

### UX Contract (Phase 5)

- Diff must support free selection of any two nodes in the same article (not only adjacent versions).
- Diff rendering should preserve clear add/remove semantics with distinct visual treatments.
- Diff view should appear in the article workspace context (no route jump required for basic compare flow).
- Export actions should be directly accessible from node context and `final.md` context:
  - Copy Markdown
  - Copy HTML (rendered from Markdown)
  - Download `.md`
- Export actions must operate on the currently selected content target to avoid ambiguity.

## Non-goals

- No PDF export
- No batch export of all nodes
- No external publishing integration

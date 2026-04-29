## Why

Users can generate, branch, and promote content but cannot compare nodes side by side or extract content for external use. Diff comparison is essential for informed promotion decisions, and export closes the loop from AI-assisted writing to publishable output.

## What Changes

- Implement node-to-node diff comparison using react-diff-viewer-continued — any two nodes (or final.md) in the same article, rendered side-by-side in the workspace
- Add export actions on any node or final.md: Copy Markdown, Copy HTML (rendered from Markdown), Download .md
- Unified `ContentTarget` model (`{ type: "node", nodeId }` or `{ type: "final" }`) shared across UI and API
- Deterministic export filename format: `[slug]-[target]-[yyyyMMdd-HHmm].md` (UTC)
- Semantic HTML output (headings, paragraphs, lists, blockquotes, code blocks) with no app-specific CSS

## Capabilities

### New Capabilities

- `node-diff`: Side-by-side diff comparison of any two content targets in the same article using react-diff-viewer-continued, with validation (both targets exist, not identical)
- `content-export`: Export content as Markdown (clipboard), HTML (clipboard, semantic output), or downloadable .md file with deterministic naming; supports node and final targets

### Modified Capabilities

_(none)_

## Impact

- **Code**: New diff and export API routes, diff viewer component in workspace, export action buttons on node and final contexts
- **APIs**: `POST /api/articles/[slug]/diff`, `POST /api/articles/[slug]/export`
- **Dependencies**: react-diff-viewer-continued (already in project), remark/rehype pipeline for server-side HTML rendering
- **Data**: No new data files — reads existing node and final content
- **Risk**: Low — read-only operations on existing content; react-diff-viewer-continued is already a project dependency

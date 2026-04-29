# Phase 5 — Diff & Export

## Summary

Implement node-to-node diff comparison and content export (copy Markdown, copy HTML, download .md). These are the final utility features that complete the writing workflow.

## Depends on

- Phase 3 (multiple nodes exist to compare and export)
- Phase 2 (full workspace page for diff rendering context)

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

### Unified Content Target Contract

All diff/export actions must resolve through one normalized content target model:

```ts
type ContentTarget =
  | { type: "node"; nodeId: string }   // v1, v2-a, v2-b ...
  | { type: "final" }                  // final.md
```

- `node` target reads from `/data/articles/[slug]/nodes/[nodeId].md`
- `final` target reads from `/data/articles/[slug]/final.md`
- UI and API must use the same target contract to avoid divergent behavior

### Export File Naming Contract

For `download .md`, filename format is deterministic:

`[slug]-[target]-[yyyyMMdd-HHmm].md`

Where:
- `target` = node id (for node targets) or `final`
- timestamp uses UTC
- slug normalization follows existing article slug rules

Examples:
- `ai-writing-v2-b-20260428-2115.md`
- `ai-writing-final-20260428-2116.md`

### HTML Rendering Contract

- Renderer: `react-markdown` compatible pipeline on frontend for preview, and `remark/rehype` equivalent server-safe pipeline for API export when needed.
- Output HTML must be semantic and portable:
  - headings (`h1-h6`), paragraphs, lists, blockquotes, code blocks
  - links with safe attributes
- No inline app-specific CSS in copied HTML output
- If target markdown is empty, return empty string (no placeholder text)

### Newline and Encoding Contract

- Source markdown normalization: `\n` line endings only
- Clipboard and download output encoding: UTF-8
- Preserve trailing newline policy consistently:
  - markdown download: ensure file ends with one trailing newline
  - copied markdown/html: do not append extra newline beyond content normalization

### Diff Behavior Contract

- Comparison supports any two `node` targets in same article
- `final` may be selected as either left/right compare target if it exists
- Diff entry validates:
  - both targets exist
  - left and right are not identical target
- Missing/invalid target must surface actionable error in UI

### UX Contract

- Diff must support free selection of any two nodes in the same article (not only adjacent versions).
- Diff rendering should preserve clear add/remove semantics with distinct visual treatments.
- Diff view should appear in the article workspace context (no route jump required for basic compare flow).
- Export actions should be directly accessible from node context and `final.md` context:
  - Copy Markdown
  - Copy HTML (rendered from Markdown)
  - Download `.md`
- Export actions must operate on the currently selected content target to avoid ambiguity.

### APIs

```
POST /api/articles/[slug]/diff
  body: {
    left: ContentTarget,
    right: ContentTarget
  }
  response: {
    left: { target: ContentTarget, content: string },
    right: { target: ContentTarget, content: string }
  }

POST /api/articles/[slug]/export
  body: {
    target: ContentTarget,
    format: "markdown" | "html" | "download-md"
  }
  response:
    - markdown/html: { content: string, mime: string }
    - download-md: stream file with deterministic filename
```

Error contract:
- `400`: invalid target or format
- `404`: article or target content missing
- `409`: diff targets identical
- `500`: unexpected rendering/export failure

## Non-goals

- No PDF export
- No batch export of all nodes
- No external publishing integration

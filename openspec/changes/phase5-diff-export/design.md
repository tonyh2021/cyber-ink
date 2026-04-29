## Context

After Phase 3, users can generate, branch, evaluate, and promote content. But there is no way to compare two nodes side by side (the UI shows nodes individually) or extract content for use outside CyberInk. Diff comparison is essential for informed promotion decisions — without it, users rely solely on evaluation scores or manual reading. Export closes the loop from AI-assisted writing to publishable output.

Current state:
- Multiple nodes exist per article (v1, v2-a, v2-b, etc.)
- `final.md` may exist after promotion
- `react-diff-viewer-continued` is already a project dependency
- Workspace page shows individual node content but no comparison view

**Depends on:**
- Phase 3 (multiple nodes exist to compare and export)
- Phase 2 (full workspace page for diff rendering context)

## Goals / Non-Goals

**Goals:**
- Side-by-side diff comparison of any two nodes in the same article
- Export content as Markdown, HTML, or downloadable file
- Unified content target model shared across UI and API
- Deterministic, portable output formats

**Non-Goals:**
- No PDF export
- No batch export of all nodes
- No external publishing integration
- No diff across articles (only within the same article)

## Decisions

### 1. Unified ContentTarget model

**Choice:** All diff/export actions resolve through one normalized content target:

```ts
type ContentTarget =
  | { type: "node"; nodeId: string }   // v1, v2-a, v2-b ...
  | { type: "final" }                  // final.md
```

- `node` target reads from `/data/articles/[slug]/nodes/[nodeId].md`
- `final` target reads from `/data/articles/[slug]/final.md`
- UI and API must use the same target contract to avoid divergent behavior

**Why a unified type:** Diff and export both need to resolve "which content?" — node or final. A shared type ensures the UI and API always agree on what's being referenced. It also simplifies the component layer: any action that takes content can accept a `ContentTarget`.

### 2. Diff behavior contract

**Choice:**
- Comparison supports any two `ContentTarget` values in the same article
- `final` may be selected as either left/right compare target if it exists
- Diff entry validates:
  - both targets exist
  - left and right are not the identical target
- Missing/invalid target surfaces an actionable error in UI
- Diff rendered side-by-side using react-diff-viewer-continued in the workspace (no route jump)

**Why free selection over adjacent-only:** Users may want to compare v2-a with v2-c (two branches from v1), or v1 with final. Restricting to adjacent versions would miss the most valuable comparisons.

### 3. Export file naming contract

**Choice:** Deterministic filename format for `download .md`:

`[slug]-[target]-[yyyyMMdd-HHmm].md`

Where:
- `target` = node id (for node targets) or `final`
- timestamp uses UTC
- slug normalization follows existing article slug rules

Examples:
- `ai-writing-v2-b-20260428-2115.md`
- `ai-writing-final-20260428-2116.md`

**Why deterministic:** Users downloading multiple versions should get distinct, sortable filenames without manual renaming. The timestamp ensures uniqueness across repeated downloads of the same node.

### 4. HTML rendering contract

**Choice:**
- Renderer: `react-markdown` compatible pipeline on frontend for preview, and `remark/rehype` equivalent server-safe pipeline for API export
- Output HTML must be semantic and portable:
  - headings (`h1-h6`), paragraphs, lists, blockquotes, code blocks
  - links with safe attributes
- No inline app-specific CSS in copied HTML output
- If target markdown is empty, return empty string (no placeholder text)

**Why no app CSS in export:** Exported HTML should be pasteable into any CMS, email, or document. App-specific styles would break in external contexts.

### 5. Newline and encoding contract

**Choice:**
- Source markdown normalization: `\n` line endings only
- Clipboard and download output encoding: UTF-8
- Trailing newline policy:
  - markdown download: ensure file ends with one trailing newline
  - copied markdown/html: do not append extra newline beyond content normalization

**Why explicit:** Inconsistent newline handling is a common source of diff noise and clipboard artifacts. Specifying the contract upfront prevents per-feature divergence.

### 6. API design

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

**Error contract:**
- `400`: invalid target or format
- `404`: article or target content missing
- `409`: diff targets identical
- `500`: unexpected rendering/export failure

**Why POST for diff:** The request contains a structured body (two content targets), which doesn't map cleanly to query parameters. POST also avoids URL length limits for complex target specifications.

## Risks / Trade-offs

- **react-diff-viewer-continued bundle size**: The library adds to client bundle. → Mitigation: already a project dependency; can lazy-load the diff component so it's only fetched when the user opens a comparison.

- **Server-side HTML rendering pipeline**: `remark/rehype` on the server duplicates some frontend rendering logic. → Mitigation: share the plugin chain configuration between client and server to ensure consistent output. The duplication is acceptable for portable HTML export.

- **Large node diffs**: Very long articles may produce slow diff renders. → Mitigation: react-diff-viewer-continued handles this reasonably; add virtualization only if performance issues are observed.

## UX Contract

- Diff must support free selection of any two nodes in the same article (not only adjacent versions).
- Diff rendering should preserve clear add/remove semantics with distinct visual treatments.
- Diff view should appear in the article workspace context (no route jump required for basic compare flow).
- Export actions should be directly accessible from node context and `final.md` context:
  - Copy Markdown
  - Copy HTML (rendered from Markdown)
  - Download `.md`
- Export actions must operate on the currently selected content target to avoid ambiguity.

## Context

Phase 1 established the generation pipeline with a minimal workspace page: a single pre-seeded article (`seed-article`), hardcoded profile/style/source, and one streaming generation endpoint. The user provides only an instruction — everything else is preset.

Current state after Phase 1:
- `src/lib/data.ts` — filesystem helpers and types
- `src/lib/prompt-builder.ts` — deterministic prompt assembly
- `POST /api/articles/[slug]/generate` — streaming generation
- `GET /api/profiles/default` — profile reader
- Workspace page with instruction input + streaming output
- `/data/` directory with config.json, profiles, styles, and one seed article

This phase must add material ingestion, article lifecycle management, and expand the workspace — without introducing the app shell or dashboard, which are deferred to `phase-ui-shell-dashboard` (after Phase 3).

**Depends on:** Phase 1 (generation pipeline, prompt builder, filesystem helpers, types, design system)

## Goals / Non-Goals

**Goals:**
- Users can create new articles with title + language
- Users can paste raw material into the workspace
- Users can delete articles
- Workspace page shows full article context: material, instruction, generation output, node tree, metadata
- Article list available via workspace sidebar

**Non-Goals:**
- No dehydration engine — raw material is passed directly to prompt builder
- No optimize (Phase 3)
- No auto-evaluation after generation (Phase 3)
- No style management (Phase 4) — uses seed style from Phase 1
- No standalone app shell polish (top nav, responsive sidebar) — `phase-ui-shell-dashboard` (after Phase 3)
- No dedicated dashboard page or dashboard routing — `phase-ui-shell-dashboard` (after Phase 3)
- No multiple source files per article — single `source.md`, user appends to add material

## Decisions

### 1. Slug generation — opaque ID, not title-derived

**Choice:** Slugs are auto-generated as `art-YYYYMMDD-NNN` (e.g. `art-20260429-001`). The title is stored in `meta.md` and displayed in the UI; the slug is a stable identifier only.

**Why:** The project targets Chinese-language writing. CJK titles produce percent-encoded URLs and filesystem paths that are hard to work with in terminals and logs. An opaque slug decouples the URL from the title entirely — titles can be changed freely without affecting URLs, directory names, or cross-references.

### 2. Article workspace directory structure

**Choice:** Each article gets a self-contained directory under `/data/articles/[slug]/`:

```
/data/articles/art-20260429-001/
  source.md          # Raw material (text paste, no dehydration yet)
  meta.json          # Article metadata (title, language, dates)
  tree.json          # Version structure + activeNode
  /nodes/            # Generated content nodes (v1.md written by generate)
  /evaluation/       # Evaluation scores (empty until Phase 3)
```

**Why:** Filesystem-native structure keeps articles self-contained and Git-friendly. Each article is an independent directory that can be moved, backed up, or deleted atomically.

### 3. Article CRUD via filesystem operations

**Choice:** Article CRUD maps directly to filesystem operations — no database layer.

| Operation | Implementation |
|-----------|---------------|
| **Create** | `mkdir` article directory + write `meta.json` + initialize empty `tree.json` + create empty `source.md` + create `/nodes/` and `/evaluation/` |
| **Delete** | `rm -rf` article directory (replaces Phase 1's reset-only DELETE) |
| **List** | `readdir` on `/data/articles/`, read each `meta.json` for summaries |
| **Get** | Read and aggregate `tree.json` + all `/nodes/*.md` + all `/evaluation/*.json` + `meta.json` (returns `evaluations: {}` until Phase 3) |

**Why over database:** The project's core principle is Markdown-native persistence. Filesystem operations are atomic at the directory level, require no migration, and produce a Git-diffable history.

### 4. Material input — single source.md, save on generate

**Choice:** Raw material goes into a single `source.md` without dehydration. The prompt builder receives the raw text as-is. Material is persisted when the user clicks Generate — not on every keystroke or blur.

**Why:**
- Single file: users paste all material into one textarea, appending additional material as needed. Multiple source files add UI complexity (list management, per-source editing) without proportional value at this stage.
- Save on generate: keeps the mental model simple — "generate" is the commit point. No auto-save state indicators or stale-data conflicts. When dehydration is added later, the generate flow is the natural place for it.

### 5. Dynamic routing — `/articles/[slug]`

**Choice:** Each article gets its own URL via Next.js dynamic route: `/articles/[slug]`. Selecting an article in the sidebar navigates to its route.

**Why:** Native to Next.js App Router. Gives browser back/forward navigation, bookmarkable URLs, and clean separation between articles. Client-side slug switching would be simpler but fights the framework.

### 6. DELETE semantics — true delete

**Choice:** `DELETE /api/articles/[slug]` performs `rm -rf` on the article directory. The Phase 1 "reset" behavior (clear nodes, reset tree.json) is removed.

**Why:** With proper article CRUD, there is no use case for resetting an article while keeping its directory. Users who want to start over can delete and recreate.

### 7. Workspace component split

**Choice:** Expand the flat `Workspace` component into sub-components:

```
Workspace
├── ArticleSidebar          # Article list + create button
├── MaterialPanel            # Text paste textarea
├── InstructionPanel         # Instruction input + generate (reuses Phase 1 components)
├── NodeDisplay              # Generated content + tree context
└── MetadataPanel            # Title, language, dates
```

**Why:** Phase 2 turns the workspace from a single-purpose form into a multi-panel layout. Splitting early keeps each component focused and testable. The panel boundaries map to distinct data sources (source.md, meta.json, tree.json, nodes/).

### 8. Empty state — "Create your first article"

**Choice:** When no articles exist, show a centered prompt encouraging the user to create their first article, with a prominent create button.

**Why:** An empty sidebar + disabled workspace is confusing. A clear call-to-action guides new users into the workflow immediately.

### 9. API design

```
POST /api/articles                      # Create article workspace
  body: { title: string, language: string }
  → 201: { slug: string }

GET  /api/articles                      # List article summaries
  → 200: ArticleSummary[]

GET  /api/articles/[slug]               # Aggregated article data
  → 200: { meta, tree, nodes, evaluations }

DELETE /api/articles/[slug]             # Delete article (rm -rf)
  → 204
```

Slug auto-generated as `art-YYYYMMDD-NNN`. NNN is a sequential counter within the day to handle collisions.

## Risks / Trade-offs

- **Filesystem list performance at scale**: `readdir` + parse frontmatter for every article on each list call. → Mitigation: acceptable for the expected scale (dozens of articles, not thousands). If needed later, add an index file.

- **No dehydration means raw material quality varies**: Prompt builder receives unprocessed text, which may include noise, formatting artifacts, or irrelevant content. → Mitigation: user is responsible for pasting clean material. Dehydration in a future phase will address this.

- **Sidebar-only article list limits discoverability**: Without a dashboard, users must use the sidebar to find articles. → Mitigation: acceptable as a temporary state. `phase-ui-shell-dashboard` adds the dashboard after Phase 3.

- **Opaque slugs are not human-memorable**: Users can't guess an article's URL from its title. → Mitigation: users navigate via sidebar, not by typing URLs. Title is always visible in the UI.

## UX Contract

- Material input exposes a single entry path: paste raw text into a textarea. Users append additional material to the same textarea.
- Material is persisted when the user clicks Generate — not auto-saved.
- Generation presents streaming output (built in Phase 1, integrated here).
- Missing inputs block generate with actionable guidance (disabled button + hint text).
- Article sidebar shows article list with title; selecting an article navigates to `/articles/[slug]`.
- Empty state (no articles) shows a "Create your first article" prompt with a create button.

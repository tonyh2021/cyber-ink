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
- No branching or optimize (Phase 3)
- No auto-evaluation after generation (Phase 3)
- No style management (Phase 4) — uses seed style from Phase 1
- No standalone app shell polish (top nav, responsive sidebar) — `phase-ui-shell-dashboard` (after Phase 3)
- No dedicated dashboard page or dashboard routing — `phase-ui-shell-dashboard` (after Phase 3)

## Decisions

### 1. Article workspace directory structure

**Choice:** Each article gets a self-contained directory under `/data/articles/[slug]/`:

```
/data/articles/[slug]/
  source.md          # Raw material (text paste, no dehydration yet)
  meta.md            # Article metadata (YAML frontmatter: title, language, status, dates)
  tree.json          # Branching structure (initialized empty, populated by Phase 3)
  /nodes/            # Generated content nodes (v1.md written by generate)
  /evaluation/       # Evaluation scores (empty until Phase 3)
```

**Why:** Filesystem-native structure keeps articles self-contained and Git-friendly. Each article is an independent directory that can be moved, backed up, or deleted atomically.

### 2. Article CRUD via filesystem operations

**Choice:** Article CRUD maps directly to filesystem operations — no database layer.

| Operation | Implementation |
|-----------|---------------|
| **Create** | `mkdir` article directory + write `meta.md` + initialize `tree.json` + create `/nodes/` and `/evaluation/` |
| **Delete** | `rm -rf` article directory |
| **List** | `readdir` on `/data/articles/`, parse each `meta.md` frontmatter for summaries |
| **Get** | Read and aggregate `tree.json` + all `/nodes/*.md` + all `/evaluation/*.json` + `meta.md` |

**Why over database:** The project's core principle is Markdown-native persistence. Filesystem operations are atomic at the directory level, require no migration, and produce a Git-diffable history.

### 3. Material input as direct text paste (no dehydration)

**Choice:** In this phase, raw material goes directly into `source.md` without dehydration. The prompt builder receives the raw text as-is.

**Why:** Dehydration (semantic kernel extraction) is a separate concern. Deferring it lets us validate the full writing workflow end-to-end before adding the extraction layer. The prompt builder already accepts source content as a string — no interface change needed when dehydration is added later.

### 4. Workspace page layout — article-centric panels

**Choice:** Expand Phase 1's minimal workspace into a multi-panel article workspace:

- **Material input panel** — textarea for raw text paste
- **Instruction input + Generate** — reuses Phase 1 components
- **Node display** — shows generated content with tree context (v1 only in this phase)
- **Article metadata** — title, language, status, dates

**Why:** All panels are co-located on one page rather than separate routes. The writing workflow is inherently sequential (paste → instruct → generate → review) and benefits from seeing all context at once.

### 5. App shell deferred — sidebar-only article list

**Choice:** Article list is provided by the workspace sidebar only. No standalone dashboard route, no top navigation bar, no responsive sidebar polish.

**Why:** The app shell wraps the full writing loop (generate → branch → evaluate → promote). Building it before branching and evaluation exist means redesigning it later. `phase-ui-shell-dashboard` ships after Phase 3 when the complete loop is available.

### 6. API design

```
POST /api/articles                      # Create article workspace
  body: { title: string, language: string }
  → 201: { slug: string }

GET  /api/articles                      # List article summaries
  → 200: ArticleSummary[]

GET  /api/articles/[slug]               # Aggregated article data
  → 200: { meta, tree, nodes, evaluations }

DELETE /api/articles/[slug]             # Delete article
  → 204

GET  /api/profiles/default              # Read profile (exists from Phase 1)
```

Slug is derived from title via kebab-case normalization. Conflicts append a numeric suffix.

## Risks / Trade-offs

- **Filesystem list performance at scale**: `readdir` + parse frontmatter for every article on each list call. → Mitigation: acceptable for the expected scale (dozens of articles, not thousands). If needed later, add an index file.

- **No dehydration means raw material quality varies**: Prompt builder receives unprocessed text, which may include noise, formatting artifacts, or irrelevant content. → Mitigation: user is responsible for pasting clean material. Dehydration in a future phase will address this.

- **Sidebar-only article list limits discoverability**: Without a dashboard, users must use the sidebar to find articles. → Mitigation: acceptable as a temporary state. `phase-ui-shell-dashboard` adds the dashboard after Phase 3.

## UX Contract

- Material input exposes a single entry path: paste raw text.
- Generation presents streaming output (built in Phase 1, integrated here).
- Missing inputs block generate with actionable guidance (disabled button + hint text).
- Article sidebar shows article list with title and status; selecting an article loads its workspace.

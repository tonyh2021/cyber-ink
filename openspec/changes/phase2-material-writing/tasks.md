# Phase 2 — Source Input & Article Management: Tasks

## Task 1: Types & Schemas

**Status:** pending

Add types and Zod schemas for article CRUD operations.

### Steps

1. Add to `src/types/index.ts`:
   - `ArticleSummary` — `{ slug, title, language, createdAt, updatedAt }`
   - `CreateArticleInput` — `{ title: string, language: string }`
   - `CreateArticleInputSchema` — Zod validation
2. Update `ArticleMeta` if needed — ensure it aligns with `meta.json` (not `meta.md`; Phase 2 uses JSON)
3. Add `NodeFrontmatter` type — `{ node: string, generatedAt: string, instruction: string, parentNode?: string }`

### Acceptance

- All types compile without errors
- Zod schemas validate correct/incorrect inputs
- `NodeFrontmatter` includes `instruction` field

---

## Task 2: Article CRUD API Routes

**Status:** pending

Implement filesystem-backed article lifecycle endpoints.

### Steps

1. `POST /api/articles` — create article:
   - Validate body with `CreateArticleInputSchema`
   - Generate slug: `art-YYYYMMDD-NNN` (scan existing dirs for collision avoidance)
   - Create directory structure: `source.md` (empty), `meta.json`, `tree.json` (empty), `/nodes/`, `/evaluation/`
   - Return `201: { slug }`
2. `GET /api/articles` — list article summaries:
   - `readdir` on `/data/articles/`, read each `meta.json`
   - Return `ArticleSummary[]` sorted by `createdAt` descending
3. `GET /api/articles/[slug]` — aggregated article data:
   - Read and aggregate `meta.json` + `tree.json` + all `/nodes/*.md` (with frontmatter) + all `/evaluation/*.json`
   - Return `{ meta, tree, nodes, evaluations }`
4. `DELETE /api/articles/[slug]` — replace Phase 1's reset-only delete:
   - `rm -rf` the entire article directory
   - Return `204`

### Acceptance

- `POST /api/articles` with `{ title, language }` creates directory with all files
- Slug format: `art-YYYYMMDD-NNN`, no collisions
- `GET /api/articles` returns summaries for all articles
- `GET /api/articles/[slug]` returns aggregated data including node frontmatter
- `DELETE /api/articles/[slug]` removes the directory entirely
- 404 for nonexistent slugs, 400 for invalid input

---

## Task 3: Update Generate API — instruction in frontmatter + multi-version support

**Status:** pending

Modify the existing generate endpoint to store instruction per-node and support sequential versions (v1, v2, v3, ...).

### Steps

1. Update `POST /api/articles/[slug]/generate`:
   - Remove the Phase 1 409 guard (rootNode already exists) — allow sequential generation
   - Compute next node name from `tree.json`: if no nodes → `v1`, if latest is `vN` → `v(N+1)`
   - Persist `source.md` from request body (save-on-generate, per decision §4)
   - Write node file with frontmatter: `{ node, generatedAt, instruction }`
   - Update `tree.json`: add node to `nodes`, update `rootNode` (if first), update `latestNode`
2. Update request schema: `{ instruction: string, source?: string }` — source is optional (only persisted if provided)

### Acceptance

- First generate creates `v1.md` with instruction in frontmatter
- Second generate creates `v2.md` with its own instruction in frontmatter
- `tree.json` correctly tracks all nodes with parent/children relationships
- `source.md` updated when source is provided in request body
- Each node's frontmatter contains the instruction that produced it

---

## Task 4: Article Sidebar

**Status:** pending

Build the sidebar component for article list and creation.

### Steps

1. Create `src/components/workspace/article-sidebar.tsx`:
   - Fetch article list from `GET /api/articles`
   - Display articles as a vertical list with title and creation date
   - Highlight the currently active article (match slug from URL)
   - "New Article" button at top — opens create dialog/form (title + language inputs)
   - Clicking an article navigates to `/articles/[slug]`
2. Create dialog or inline form for article creation:
   - Title input (required)
   - Language select (from config or default)
   - Submit calls `POST /api/articles`, then navigates to the new article
3. Style per design system — surface-panel background, border-default separator

### Acceptance

- Sidebar lists all articles with title
- Creating a new article works end-to-end (form → API → navigate)
- Active article visually highlighted
- Empty state: sidebar shows "No articles" with create button

---

## Task 5: Source Panel

**Status:** pending

Build the source material input component.

### Steps

1. Create `src/components/workspace/source-panel.tsx`:
   - Textarea for pasting raw source material
   - Loads existing `source.md` content when article is opened
   - State managed locally — persisted only on generate (decision §4)
   - Auto-resize or scrollable
2. Wire source content into the generate flow:
   - Pass source text from SourcePanel to the generate request body
   - Generate API persists source before building prompt

### Acceptance

- Textarea loads existing source content for the article
- User can paste/edit source material
- Source content is sent with the generate request
- Source is persisted to `source.md` when generate is called
- Empty source blocks generation (disabled button + hint)

---

## Task 6: Dynamic Routing & Workspace Expansion

**Status:** pending

Add per-article routing and expand the workspace layout.

### Steps

1. Create `src/app/articles/[slug]/page.tsx`:
   - Server component: validate slug, fetch article data
   - Render expanded `Workspace` with article context
2. Expand `Workspace` component into sub-component layout (decision §7):
   - `ArticleSidebar` (left) — article list
   - Main area: `SourcePanel` + `InstructionPanel` + `NodeDisplay` + `MetadataPanel`
   - Layout: sidebar + main content area
3. Create `src/components/workspace/metadata-panel.tsx`:
   - Display title, language, creation date
   - Read-only in Phase 2
4. Update `src/components/workspace/node-display.tsx` (rename from output-stream or wrap):
   - Show generated content for the active/latest node
   - Display node name and generation timestamp
   - Show the instruction used (from node frontmatter)
5. Update root `page.tsx` to redirect to articles list or empty state

### Acceptance

- `/articles/[slug]` renders the full workspace for that article
- Sidebar visible on all article pages
- Source panel, instruction panel, node display, and metadata panel all render
- Node display shows the instruction that produced the current node
- Navigation between articles works via sidebar
- Empty state shown when no articles exist

---

## Task 7: Delete Article Flow

**Status:** pending

Wire up article deletion in the UI.

### Steps

1. Add delete action to article sidebar or workspace:
   - Confirmation dialog before delete
   - Call `DELETE /api/articles/[slug]`
   - After delete, navigate to another article or empty state
2. Remove Phase 1's reset-style delete button from workspace

### Acceptance

- User can delete an article with confirmation
- After deletion, the article is gone from sidebar and filesystem
- Navigation falls back to another article or empty state
- No orphan state (e.g., viewing a deleted article)

---

## Dependency Graph

```
Task 1 (types & schemas)
  │
  ├─→ Task 2 (article CRUD API)
  │     │
  │     ├─→ Task 4 (article sidebar)
  │     │
  │     └─→ Task 7 (delete flow)
  │
  └─→ Task 3 (update generate API)
        │
        └─→ Task 5 (source panel)
              │
              └─→ Task 6 (dynamic routing & workspace expansion)
                    ↑
              Task 4 (also needed)
```

**Parallel after Task 1:** Tasks 2 and 3 can run in parallel.
**Task 4 depends on:** Task 2 (needs article list API).
**Task 5 depends on:** Task 3 (needs updated generate API that accepts source).
**Task 6 merges:** needs Task 4 (sidebar) + Task 5 (source panel).
**Task 7 depends on:** Task 2 (needs delete API).

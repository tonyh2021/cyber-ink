# Phase 2 — Source Input & Article Management: Tasks

- [x] Task 1: Types & Schemas — Add `ArticleSummary`, `CreateArticleInput`, `CreateArticleInputSchema`, `NodeFrontmatter` to `src/types/index.ts`
- [x] Task 2: Article CRUD API — `POST/GET /api/articles`, `GET/DELETE /api/articles/[slug]` with filesystem ops
- [x] Task 3: Update Generate API — multi-version support, instruction in frontmatter, source save-on-generate
- [x] Task 4: Article Sidebar — collapsible sidebar with article list, version info, create button, theme toggle
- [x] Task 5: Source Panel — textarea wired into generate flow, persisted on generate
- [x] Task 6: Dynamic Routing & Workspace — `/workspace/[slug]` routing, sub-component layout, show instruction per node
- [x] Task 7: Delete Article Flow — delete button in UI with confirmation dialog, navigate after delete

## Task Details

### Task 1: Types & Schemas

Add shared types and Zod schemas for article CRUD operations to `src/types/index.ts`:

1. `ArticleSummary` — `{ slug, title, language, createdAt, updatedAt, versionCount, activeNode }`
2. `CreateArticleInput` — `{ title: string, language: string }`
3. `CreateArticleInputSchema` — Zod validation for create input
4. `NodeFrontmatter` — `{ node: string, generatedAt: string, instruction: string, parentNode?: string }`

**Acceptance:** All types compile. Zod schemas validate correct/incorrect inputs. `NodeFrontmatter` includes `instruction` field.

### Task 2: Article CRUD API (done)

Implemented: `POST/GET /api/articles`, `GET/DELETE /api/articles/[slug]` with filesystem operations, slug generation `art-YYYYMMDD-NNN`.

### Task 3: Update Generate API (done)

Implemented: removed Phase 1 409 guard, sequential version naming, instruction stored in node frontmatter, source save-on-generate.

### Task 4: Article Sidebar (done)

Implemented: collapsible sidebar (220px↔56px animated), article list with version info, server-side initial data, "New Article" button, theme toggle.

### Task 5: Source Panel (done)

Implemented: textarea for source material, wired into generate request, persisted on generate, empty source blocks generation.

### Task 6: Dynamic Routing & Workspace Expansion

Routing and layout are done. Remaining work:

1. Node display should show the instruction used for the currently viewed node (from frontmatter)
2. Verify node tab switching loads correct content and instruction

**Acceptance:** Node display shows instruction that produced current node. Navigation between articles works. Empty state shown when no articles exist.

### Task 7: Delete Article Flow

Wire up article deletion in the UI:

1. Add delete action — context menu or button in sidebar/workspace
2. Confirmation dialog before delete
3. Call `DELETE /api/articles/[slug]`
4. After delete, navigate to another article or empty state
5. Remove Phase 1's reset-style delete button (already removed)

**Acceptance:** User can delete with confirmation. Article removed from sidebar and filesystem. Navigation falls back gracefully.

## Dependency Graph

```
Task 1 (types) ─→ used by Task 2, 3 (already done — refactor imports)
Task 6 (remaining: instruction display)
Task 7 (delete UI)
```

Tasks 1, 6, 7 can be done in any order.

# Phase 2 — Material Ingestion & Article Management

## Summary

Implement material ingestion (text paste), article CRUD, and the full workspace page in an article-centric layout. After this phase, users can create articles, paste raw material, and generate drafts through a complete writing workflow UI.

## Depends on

- Phase 1 (generation pipeline, prompt builder, filesystem helpers, types, design system)

## Scope

### Material Input

Single input source:
- **Text paste** — user pastes raw material directly

### Article CRUD

- **Create** — title + language → initializes workspace directory (meta.md, tree.json, /nodes/, /evaluation/)
- **Delete** — removes entire article directory
- **List** — article summaries for dashboard/sidebar
- **Get** — aggregated: tree + nodes + evals + meta

### Full Workspace Page

Expands Phase 1's minimal workspace into the complete article workspace:
- Material input panel (text paste)
- Instruction input + generate (reuses Phase 1 generation pipeline)
- Node display with tree context
- Article metadata display

### Dashboard Page

- No standalone dashboard route in this phase.
- Article list is provided by the workspace sidebar only.
- Dashboard-style overview is deferred to Phase 2.5.

### UX Contract

- Material input exposes a single entry path: paste raw text
- Generation presents streaming output (built in Phase 1, integrated here)
- Missing inputs block generate with actionable guidance

### APIs

```
POST /api/articles                      # Create article workspace
GET  /api/articles                      # List article summaries
GET  /api/articles/[slug]               # Aggregated: tree + nodes + evals + meta
DELETE /api/articles/[slug]             # Delete article
GET  /api/profiles/default              # Read profile (exists from Phase 1)
```

## Non-goals

- No dehydration engine (deferred to later phase) — raw material is passed directly to prompt builder
- No branching or optimize yet (Phase 3)
- No auto-evaluation after generation yet (Phase 3)
- No style management (Phase 4) — uses seed style from Phase 1
- No standalone app shell polish (top nav architecture, responsive collapse refinements)
- No dedicated dashboard page or dashboard routing decisions (moved to Phase 2.5)

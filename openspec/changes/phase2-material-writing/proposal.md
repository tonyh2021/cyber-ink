## Why

Phase 1 proves the generation pipeline with preset inputs. Users still cannot create articles, paste source material, or manage their workspace. Without source input and article CRUD, the tool is a demo — not a usable writing workflow.

## What Changes

- Add source input via text paste — users paste source material directly into the workspace
- Implement article CRUD: create (title + language → initialize workspace directory), delete, list, get (aggregated: tree + nodes + evals + meta)
- Expand Phase 1's minimal workspace into a full article workspace with source input panel, instruction input, node display with tree context, and article metadata
- Article list served via workspace sidebar only (no standalone dashboard route yet)
- Dynamic routing: each article gets its own URL at `/articles/[slug]`

## Capabilities

### New Capabilities

- `source-input`: Text paste input for source material, with validation that blocks generation when inputs are missing
- `article-crud`: Article lifecycle management — create workspace directory (meta.json, tree.json, source.md, /nodes/, /evaluation/), delete (rm -rf), list summaries, get aggregated article data
- `article-workspace`: Full workspace page layout combining source input, instruction input, generation output, node display with tree context, and metadata display

### Modified Capabilities

_(none)_

## Impact

- **Code**: New API routes (`POST/GET /api/articles`, `GET/DELETE /api/articles/[slug]`), dynamic route `/articles/[slug]`, workspace page expansion with sub-component split, source input component, article sidebar
- **APIs**: 4 new endpoints for article CRUD; `GET /api/profiles/default` reused from Phase 1
- **Dependencies**: No new dependencies beyond Phase 1 stack
- **Data**: New article directories created under `/data/articles/` with standard structure (source.md, meta.md, tree.json, /nodes/, /evaluation/). Slug format: `art-YYYYMMDD-NNN`
- **Risk**: Low — extends existing generation pipeline with CRUD and input surfaces

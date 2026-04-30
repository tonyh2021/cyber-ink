# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CyberInk — A file-system-based AI writing decision engine with version exploration, auto-evaluation, and style self-learning feedback loop. Users provide source material, generate sequential drafts, optimize variants, evaluate quality, and select an active version. Style fingerprints evolve through user feedback.

Core principles: Control-first · Source-driven · Markdown-native · Evaluation-looped · Version-structured · Self-improving

## Tech Stack

- **Framework**: Next.js (App Router)
- **AI SDK**: Vercel AI SDK
- **Models**: Configured via `/data/config.json` — two roles: writing (Claude), analysis (GPT-4o-mini, handles analysis + evaluation + style extraction)
- **Markdown parsing**: gray-matter
- **Diff rendering**: react-diff-viewer-continued
- **Config**: API keys in `.env` only

## Build & Dev Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start dev server
pnpm build           # Production build
pnpm lint            # Lint check
```

## Architecture — Three Layers

1. **Ingestion Layer** — Text paste input
2. **Intelligence Layer** — Prompt Builder → Generation Engine → Evaluation Engine → Feedback Collector
3. **Persistence Layer** — Markdown-native filesystem, tree.json, config.json, Git-compatible

### Core Flow

Source (paste) → `source.md` → Prompt Builder (profile + style + source + instruction) → generate `v1.md` → auto-evaluate → user generates more versions / optimizes → evaluate → user sets activeNode

### Version Model

```
v1              # generate 1
v2              # generate 2
├── v2-a        # optimize of v2
├── v2-b        # optimize of v2
v3              # generate 3
├── v3-a        # optimize of v3
```

- `generate`: creates sequential versions (v1, v2, v3, ...) — each is an independent generation from source material
- `optimize`: creates a variant of a specific version (v2 → v2-a, v2-b, ...) — one level only, optimize outputs cannot be optimized further
- `activeNode`: tracks the user's currently selected node in `tree.json`

## Data Layout

```
/data/
  config.json                          # Model provider/model config
  /profiles/default.md                 # Channel identity (read-only)
  /styles/[style-name]/
    v1.md, v2.md, active.md            # Style versions + pointer (active.md also serves as rollback)
    /feedback/[slug]-[node].md         # Full-node feedback (boolean: one file per node)
    /feedback/[slug]-[node]-para.md    # Paragraph-level feedback (single file, multiple paragraphs)
    /references/ref-001.md, ...        # Pre-stored reference articles for style regeneration
  /articles/[slug]/
    source.md                          # Raw material (user-pasted text)
    meta.md                            # Article metadata (YAML frontmatter)
    tree.json                          # Version structure + activeNode
    /nodes/v1.md, v2.md, v2-a.md, ... # Generated content nodes
    /evaluation/v1.json, v2.json, ... # Evaluation scores per node
```

## API Routes

| Group      | Key Endpoints                                                                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Article    | `POST /api/articles`, `DELETE /api/articles/[slug]`, `GET /api/articles/[slug]` (aggregated: tree+nodes+evals+meta), `POST .../generate`, `POST .../optimize` |
| Evaluation | `POST /api/evaluate/node`, `GET /api/evaluate/[slug]/[node]`                                                                                                                                         |
| Style      | `GET /api/styles`, `GET /api/styles/active`, `POST /api/styles/regenerate`, `POST /api/styles/set-active`                                                                                            |
| Feedback   | `POST /api/feedback`, `GET /api/feedback`, `DELETE /api/feedback/[id]`                                                                                                                               |
| Profile    | `GET /api/profiles/default`                                                                                                                                                                          |

## Key Concepts

- **Prompt Builder**: Deterministic system prompt assembled from profile + active style + source material + user instruction + language + output format.
- **Evaluation**: Auto-scored after every generation (clarity, style_match, information_density, reader_engagement, hallucination_risk, overall_score). Scores are advisory only — user selects activeNode at their discretion.
- **Style Feedback Loop**: User marks good content → feedback stored → style regeneration uses pre-stored reference articles (`/references/`) + feedback → analysis model multi-round processing → new style version. Feedback belongs to the style system, not articles.

## Design System

- **Dual theme**: Dark (default) + Light, controlled via `data-theme="dark|light"` on `<html>`, respects `prefers-color-scheme`
- **Implementation**: CSS custom properties swap only — no component rewrite between themes
- **Token naming**: `--brand-accent`, `--surface-root`, `--surface-panel`, `--surface-card`, `--surface-canvas`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border-default`, `--color-success/warning/danger`, etc.
- **Fonts**: Source Sans 3 + Source Han Sans (UI chrome) / JetBrains Mono + Source Han Mono (AI-generated content + node labels) — this boundary is sacred
- **Brand accent**: Light `#006b85` / Dark `#00d4ff` (darkened for WCAG AA on light backgrounds)
- **Writing canvas**: Dark `#1e1e2e` / Light `#f7f6f1` (warm paper tint — the ONE warm exception in the palette)
- **Radius scale**: 4px (tags) / 8px (buttons, inputs) / 12px (cards) / 16px (modals only)
- **Depth model**: Dark uses surface layering; Light uses subtle shadows
- **Design file**: `design/cyber-ink.pen` — visual token catalog and component showcase (Pencil format)

## Code Conventions

- All code, comments, variable names, and UI copy in English.
- Markdown files use YAML frontmatter (parsed with gray-matter).
- Evaluation scores are 0–1 floats stored as JSON.
- `tree.json` is the single source of truth for node relationships and activeNode.

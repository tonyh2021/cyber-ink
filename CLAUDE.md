# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CyberInk — A file-system-based AI writing decision engine with branching exploration, auto-evaluation, and style self-learning feedback loop. Users ingest material, generate tree-structured drafts (2-level max), evaluate quality, and promote a final version. Style fingerprints evolve through user feedback.

Core principles: Control-first · Material-driven · Markdown-native · Evaluation-looped · Tree-structured · Self-improving

## Tech Stack

- **Framework**: Next.js (App Router)
- **AI SDK**: Vercel AI SDK
- **Models**: Configured via `/data/config.json` — writing model (Claude), analysis/evaluation model (GPT-4o-mini)
- **Markdown parsing**: gray-matter
- **Diff rendering**: react-diff-viewer-continued
- **Search**: tavily-sdk
- **Config**: API keys in `.env` only

## Build & Dev Commands

```bash
pnpm install         # Install dependencies
pnpm dev             # Start dev server
pnpm build           # Production build
pnpm lint            # Lint check
```

## Architecture — Three Layers

1. **Ingestion Layer** — Text paste / Tavily search input
2. **Intelligence Layer** — Dehydration Engine → Prompt Builder → Generation Engine → Branch Manager → Evaluation Engine → Feedback Collector
3. **Persistence Layer** — Markdown-native filesystem, tree.json, config.json, Git-compatible

### Core Flow

Material → dehydrate → `source.md` → Prompt Builder (profile + style + source + instruction) → generate `v1.md` → auto-evaluate → user branches/optimizes → evaluate → highlight bestNode → user promotes → `final.md`

### Branching Model (2-level cap)

```
v1              # Root (depth 1)
├── v2-a        # Branch (depth 2)
├── v2-b        # Branch (depth 2, max 4 siblings)
└── v2-c        # Branch (depth 2)
```

- `generate`: creates v1
- `branch`: forks v1 only → v2-x (depth-2 nodes cannot branch further)
- `optimize`: in-place rewrite on any node

## Data Layout

```
/data/
  config.json                          # Model provider/model config
  /profiles/default.md                 # Channel identity (read-only)
  /styles/[style-name]/
    v1.md, v2.md, active.md            # Style versions + pointer
    /feedback/[slug]-[node].md         # Full-node feedback
    /feedback/[slug]-[node]-para.md    # Paragraph-level feedback
  /articles/[slug]/
    source.md                          # Dehydrated semantic kernel
    meta.md                            # Article metadata (YAML frontmatter)
    tree.json                          # Branching structure + bestNode
    final.md                           # Promoted final version
    /nodes/v1.md, v2-a.md, ...         # Generated content nodes
    /evaluation/v1.json, v2-a.json     # Evaluation scores per node
```

## API Routes

| Group | Key Endpoints |
|-------|--------------|
| Writing | `POST /api/articles`, `POST .../generate`, `POST .../branch`, `POST .../optimize`, `POST .../promote` |
| Evaluation | `POST /api/evaluate/node`, `GET /api/evaluate/[slug]/[node]` |
| Style | `GET /api/styles/active`, `POST /api/styles/regenerate`, `POST /api/styles/set-active` |
| Feedback | `POST /api/feedback`, `GET /api/feedback`, `DELETE /api/feedback/[id]` |
| Material | `POST /api/material/dehydrate`, `POST /api/material/search` |

## Key Concepts

- **Dehydration**: Extracts semantic kernel (core_ideas, arguments, facts, quotes, entities, quality_flags) from raw material — not a summary, but "semantic fuel" for writing.
- **Prompt Builder**: Deterministic system prompt assembled from profile + active style + dehydrated source + user instruction + language + output format.
- **Evaluation**: Auto-scored after every generation (clarity, style_match, information_density, reader_engagement, hallucination_risk, overall_score). Scores are advisory only — user always has final promote authority.
- **Style Feedback Loop**: User marks good content → feedback stored → style regeneration uses external articles + feedback as few-shot examples → new style version.

## Code Conventions

- All code, comments, variable names, and UI copy in English.
- Markdown files use YAML frontmatter (parsed with gray-matter).
- Evaluation scores are 0–1 floats stored as JSON.
- `tree.json` is the single source of truth for node relationships and bestNode.

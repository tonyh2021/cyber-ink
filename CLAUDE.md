# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CyberInk — A file-system-based AI writing decision engine with version exploration and multi-round polish. Users provide source material, generate sequential drafts, polish content through conversational editing, and select a version to keep.

Core principles: Control-first · Source-driven · Markdown-native · Version-structured · Client-editable

## Tech Stack

- **Framework**: Next.js (App Router)
- **AI SDK**: Vercel AI SDK
- **Models**: Configured via `/data/config.json` — writing model (Claude) for generation and polish
- **Markdown parsing**: gray-matter
- **Diff rendering**: react-diff-viewer-continued
- **Client storage**: localStorage (editable styles)
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
2. **Intelligence Layer** — Prompt Builder → Generation Engine → Polish Engine
3. **Persistence Layer** — Markdown-native filesystem, tree.json, config.json, Git-compatible

### Core Flow

Source (paste) → `source.md` → Prompt Builder (profile + references + instruction + source) → generate `v1.md` → user generates more versions / polishes → user applies preferred version

### Version Model

- `generate`: creates sequential versions (v1, v2, v3, ..., max 5) — each is an independent generation from source material; oldest is pruned when limit is reached
- `polish`: multi-round conversational editing of a selected version — modifies in-place, user can apply any round or discard

## Data Layout

```
/data/
  config.json                          # Model provider/model config + language
  /profiles/default.md                 # Channel identity (YAML frontmatter + body)
  /instruction/
    instruction.md                     # Writing style instruction (injected as "Style Instruction")
    polish-prompt.md                   # Polish assistant system prompt
  /references/[group-name]/
    1.md, 2.md, ...                    # Reference articles for writing technique extraction
  /articles/[slug]/
    source.md                          # Raw material (user-pasted text)
    meta.json                          # Article metadata (title, styleRef, etc.)
    tree.json                          # Version structure (rootNode, bestNode, latestNode, nodes)
    /nodes/v1.md, v2.md, ...           # Generated content nodes (frontmatter: node, generatedAt, instruction)
    /.polish/                           # Active polish session (temporary, removed on apply/discard)
      target.json                      # Which node is being polished
      original.md                      # Unmodified base content
      history.json                     # Conversation history
      /rounds/1.md, 2.md, ...          # Polish round outputs
```

## API Routes

| Group   | Key Endpoints                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Article | `POST /api/articles`, `DELETE /api/articles/[slug]`, `GET /api/articles/[slug]` (aggregated), `POST .../generate`          |
| Polish  | `POST .../polish/start`, `POST .../polish/round`, `GET .../polish/status`, `POST .../polish/apply`, `POST .../polish/discard` |

## Key Concepts

- **Prompt Builder** (`src/lib/prompt-builder.ts`): Pure function. System prompt assembled from Profile → Reference Articles (technique extraction) → Style Instruction. User message contains Source Material + user instruction. All prompt content lives in `/data/` files; the builder only handles structure.
- **Stream Control**: Generation supports stop/abort. Stop button replaces generate button during streaming, with full state rollback on abort. Version pruning is deferred to `onFinish` with abort guard for data safety.
- **Polish** (`buildPolishPrompt`): Multi-round conversational editing. System prompt from `polish-prompt.md`. Conversation uses a sliding window of the last 3 rounds. User can apply any round by index or revert to original. Supports **text selection quote-to-instruct** — user selects text in the canvas, quotes it, and the quote is prepended to the polish instruction for precise context.
- **Editable Styles** (`src/components/styles-provider.tsx`, `src/hooks/use-styles.ts`): Style data (profile, instruction, polish prompt, references) is editable in-browser via the Styles page and persisted to localStorage. `StylesProvider` wraps the app and seeds localStorage from `/data/` files on first load. Generate and polish APIs accept style data from the client; filesystem is the fallback. Import/export supported per style item.

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
- `tree.json` is the single source of truth for node relationships (rootNode, bestNode, latestNode, nodes).

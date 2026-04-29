# Phase 1 — Generation Pipeline

## Summary

Set up the project, data layer, prompt builder, and a minimal workspace page that streams a generated draft from preset inputs. The user provides only a writing instruction — everything else (profile, style, source material) is pre-seeded. This phase proves the core generation loop end-to-end.

## Motivation

Generation is the core value of CyberInk. Rather than building CRUD and navigation chrome first, Phase 1 delivers a working creation flow: instruction in → streamed draft out. All surrounding features (article management, dehydration, evaluation, branching) build on top of this proven pipeline.

## Scope

### Project Setup

- Next.js App Router, TypeScript, Tailwind CSS v4
- shadcn/ui for UI primitives (wraps Radix, rethemed with token system)
- Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`)
- `.env` for API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY)

### Data Layer

Filesystem helpers, types, and seed data:

```
/data/
  config.json                          # Models + language (user-configurable)
  /profiles/
    default.md                         # Channel identity (preset)
  /styles/
    default/
      active.md                        # Seed style (preset)
  /articles/
    seed-article/                      # Pre-created article workspace
      source.md                        # Pre-filled dehydrated material
      meta.md                          # Article metadata
      tree.json                        # Empty tree
      /nodes/                          # Generation writes here
      /evaluation/                     # Empty (Phase 3)
```

### config.json

```json
{
  "models": {
    "writing": { "provider": "anthropic", "model": "claude-sonnet-4-5" },
    "analysis": { "provider": "openai", "model": "gpt-4o-mini" }
  },
  "language": "zh"
}
```

Phase 1: read-only (user edits file manually). Future phases: settings UI reads + writes config.json.

### Prompt Builder

Deterministic system prompt assembly:

```
Profile (default.md)
  + Active style (styles/default/active.md)
  + Dehydrated source (articles/[slug]/source.md)
  + User instruction (from textarea)
  + Language (from config.json)
  + Output format (Markdown)
  → System prompt for writing model
```

### Generation Engine

- `POST /api/articles/[slug]/generate` — accepts `{ instruction: string }`
- Reads config.json for model selection and language
- Calls Prompt Builder to assemble the full prompt
- Streams response from writing model via Vercel AI SDK
- On completion: saves `nodes/v1.md`, updates `tree.json` (rootNode, latestNode = "v1")

### Workspace Page

Minimal UI — no app shell, no sidebar, no navigation:

```
┌────────────────────────────────────────────┐
│  Instruction input (textarea)              │
└────────────────────────────────────────────┘
  [ Generate ]

┌────────────────────────────────────────────┐
│                                            │
│  Streaming output area                     │
│  (Markdown rendered, JetBrains Mono)       │
│                                            │
└────────────────────────────────────────────┘
```

### APIs

```
POST   /api/articles/[slug]/generate     # Stream generation
GET    /api/profiles/default             # Read profile
```

## Non-goals

- No dashboard or article list page (`phase-ui-shell-dashboard`, after Phase 3)
- No article CRUD UI (create/delete dialogs)
- No app shell (top nav, sidebar, navigation) (`phase-ui-shell-dashboard`, after Phase 3)
- No dehydration (source.md is pre-filled)
- No evaluation, branching, or optimize
- No style system beyond seed file
- No settings UI (config.json edited manually)

# Phase 1 — Generation Pipeline: Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Workspace Page                                         │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │  Instruction textarea                            │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  │  [ Generate ]                                           │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │  Streaming Markdown output (JetBrains Mono)      │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ POST /api/articles/[slug]/generate (streaming)
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router — Route Handlers                         │
│                                                              │
│  Prompt Builder                                              │
│    profile + style + source + instruction + language          │
│    → system prompt                                           │
│                                                              │
│  Generation Engine                                           │
│    Vercel AI SDK → writing model (streaming)                 │
│    → save nodes/v1.md + update tree.json                     │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ fs read/write
┌─────────────────────────────────────────────────────────────┐
│  /data/ (filesystem persistence)                             │
│                                                              │
│  config.json              (models + language)                │
│  /profiles/default.md     (channel identity)                 │
│  /styles/default/active.md (seed style)                      │
│  /articles/seed-article/                                     │
│    source.md  meta.md  tree.json  /nodes/  /evaluation/      │
└─────────────────────────────────────────────────────────────┘
```

## 1. Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout: fonts, theme, providers
│   │   ├── globals.css                # CSS custom properties (DESIGN.md tokens)
│   │   ├── page.tsx                   # Workspace page (seed article)
│   │   └── api/
│   │       ├── articles/
│   │       │   └── [slug]/
│   │       │       └── generate/
│   │       │           └── route.ts   # POST: stream generation
│   │       └── profiles/
│   │           └── default/
│   │               └── route.ts       # GET: read profile
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (button, textarea, card)
│   │   └── workspace/
│   │       ├── instruction-input.tsx   # Textarea for writing instruction
│   │       ├── generate-button.tsx     # Generate trigger
│   │       └── output-stream.tsx       # Streaming Markdown renderer
│   ├── lib/
│   │   ├── data.ts                    # Filesystem helpers
│   │   ├── config.ts                  # Read config.json
│   │   ├── prompt-builder.ts          # Assemble system prompt
│   │   └── utils.ts                   # cn() helper
│   └── types/
│       └── index.ts                   # Shared TypeScript types
├── data/
│   ├── config.json
│   ├── profiles/
│   │   └── default.md
│   ├── styles/
│   │   └── default/
│   │       └── active.md
│   └── articles/
│       └── seed-article/
│           ├── source.md
│           ├── meta.md
│           ├── tree.json
│           ├── nodes/
│           └── evaluation/
├── .env
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## 2. Design System — Tailwind v4 + CSS Tokens

Tailwind v4 uses CSS-first configuration. No `tailwind.config.ts`.

### `globals.css`

All DESIGN.md tokens as CSS custom properties, plus Tailwind v4 theme extension:

```css
@import "tailwindcss";

@theme {
  --color-brand-accent: var(--brand-accent);
  --color-brand-accent-hover: var(--brand-accent-hover);
  --color-brand-accent-dim: var(--brand-accent-dim);

  --color-surface-root: var(--surface-root);
  --color-surface-panel: var(--surface-panel);
  --color-surface-card: var(--surface-card);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-canvas: var(--surface-canvas);

  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-accent: var(--text-accent);

  --color-border-default: var(--border-default);
  --color-border-subtle: var(--border-subtle);

  --font-family-sans: var(--font-inter);
  --font-family-mono: var(--font-mono);

  --radius-sharp: 4px;
  --radius-standard: 8px;
  --radius-card: 12px;
  --radius-modal: 16px;
}

[data-theme="dark"] {
  --brand-accent: #00d4ff;
  --brand-accent-hover: #00b8e0;
  --brand-accent-dim: rgba(0, 212, 255, 0.15);
  --surface-root: #0d0d14;
  --surface-panel: #1e1e2e;
  --surface-card: #262638;
  --surface-elevated: #2e2e42;
  --surface-canvas: #1e1e2e;
  --text-primary: #e8e8f0;
  --text-secondary: #a8a8bc;
  --text-muted: #6b6b80;
  --text-accent: #00d4ff;
  --border-default: #2e2e42;
  --border-subtle: #1e1e2e;
  /* ... remaining DESIGN.md tokens */
}

[data-theme="light"] {
  --brand-accent: #0088a8;
  --brand-accent-hover: #006d88;
  --brand-accent-dim: rgba(0, 136, 168, 0.08);
  --surface-root: #f5f5f8;
  --surface-panel: #ededf2;
  --surface-card: #ffffff;
  --surface-elevated: #ffffff;
  --surface-canvas: #f7f6f1;
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a5e;
  --text-muted: #8b8b9a;
  --text-accent: #0088a8;
  --border-default: #d8d8e0;
  --border-subtle: #e8e8ee;
  /* ... remaining DESIGN.md tokens */
}
```

Tailwind utility classes then work naturally: `bg-surface-root`, `text-brand-accent`, `rounded-card`, etc.

### Fonts

Self-hosted via `next/font/google` in root layout:

```ts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
```

### Theme Switching

`next-themes` with `attribute="data-theme"`, `defaultTheme="dark"`. Phase 1 includes the theme provider but no toggle UI — the workspace page uses dark theme by default.

## 3. Filesystem Helpers (`src/lib/data.ts`)

Central module for all `/data/` filesystem access. No raw `fs` calls in route handlers.

```ts
const DATA_DIR = path.join(process.cwd(), 'data')

readMarkdown(relativePath)     → { frontmatter, content }   // gray-matter
writeMarkdown(relativePath, frontmatter, content)
readJson<T>(relativePath)      → T
writeJson(relativePath, data)  → void
ensureDir(relativePath)        → void
removeDir(relativePath)        → void
listDirs(relativePath)         → string[]
listFiles(relativePath, ext)   → string[]   // for reading nodes/*.md, evaluation/*.json
exists(relativePath)           → boolean
```

All paths resolved relative to `DATA_DIR`. No absolute path injection.

## 4. TypeScript Types (`src/types/index.ts`)

```ts
interface ArticleMeta {
  title: string;
  slug: string;
  language: string;
  status: "draft" | "final";
  styleRef: string | null;
  styleVersion: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticleTree {
  rootNode: string | null;
  bestNode: string | null;
  latestNode: string | null;
  nodes: Record<string, TreeNode>;
}

interface TreeNode {
  parent: string | null;
  depth: number;
  children: string[];
}

interface ArticleDetail {
  meta: ArticleMeta;
  tree: ArticleTree;
  nodes: Record<
    string,
    { frontmatter: Record<string, unknown>; content: string }
  >;
  evaluations: Record<string, EvaluationScores>;
}

interface EvaluationScores {
  clarity: number;
  style_match: number;
  information_density: number;
  reader_engagement: number;
  hallucination_risk: number;
  overall_score: number;
}

interface AppConfig {
  models: {
    writing: { provider: string; model: string };
    analysis: { provider: string; model: string };
  };
  language: string;
}

interface GenerateInput {
  instruction: string;
}
```

## 5. Config System (`src/lib/config.ts`)

```ts
getConfig(): Promise<AppConfig>  // reads /data/config.json
```

Read-only in Phase 1. Future phases add settings UI that writes back.

## 6. Prompt Builder (`src/lib/prompt-builder.ts`)

Deterministic system prompt assembly. No LLM calls — pure string construction.

```
Input:
  - profile: string        (content of profiles/default.md)
  - style: string          (content of styles/default/active.md)
  - source: string         (content of articles/[slug]/source.md)
  - instruction: string    (user input from textarea)
  - language: string       (from config.json)

Output:
  - systemPrompt: string   (assembled system prompt)
  - userMessage: string    (instruction + source material)
```

### Prompt Structure

```
System prompt:
  [Profile section]     — who you are, your voice, your audience
  [Style section]       — writing style guidelines
  [Output rules]        — language, format (Markdown), constraints

User message:
  [Source material]     — dehydrated semantic kernel
  [Instruction]         — what the user wants written
```

**Design decisions:**

- Profile and style go in system prompt (stable context, cacheable)
- Source material and instruction go in user message (varies per generation)
- Language is an output rule, not part of the instruction
- Output format is always Markdown

## 7. Generation API (`POST /api/articles/[slug]/generate`)

### Request Flow

```
POST /api/articles/[slug]/generate
  Body: { instruction: string }
    │
    ├─ Read config.json → model config + language
    ├─ Read profiles/default.md → profile content
    ├─ Read styles/[styleRef]/active.md → style content (or styles/default/active.md)
    ├─ Read articles/[slug]/source.md → source material
    ├─ Read articles/[slug]/tree.json → check no rootNode exists
    │
    ├─ Prompt Builder → systemPrompt + userMessage
    │
    ├─ Vercel AI SDK streamText()
    │   provider: config.models.writing.provider
    │   model: config.models.writing.model
    │   system: systemPrompt
    │   messages: [{ role: "user", content: userMessage }]
    │
    ├─ Stream response to client
    │
    └─ onFinish callback:
        ├─ Save full text → articles/[slug]/nodes/v1.md
        └─ Update tree.json:
            rootNode: "v1"
            latestNode: "v1"
            nodes: { "v1": { parent: null, depth: 1, children: [] } }
```

### Streaming

Uses Vercel AI SDK's `streamText` → returns a streaming response. The client uses `useChat` or `useCompletion` from `@ai-sdk/react` to consume the stream.

### Error Cases

- 404: article slug not found
- 400: missing instruction
- 409: rootNode already exists (v1 already generated — Phase 2+ handles re-generation)
- 500: model API error (surface error message to client)

## 8. Workspace Page

### Layout

Single-page, no shell chrome. Dark theme by default.

```
┌─────────────────────────────────────────────────────────────┐
│  Workspace Page (max-width centered)                         │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Instruction                                          │   │
│  │  (textarea, Inter font, auto-resize)                  │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  [ Generate ]     (primary button, brand-accent)             │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Output                                               │   │
│  │  (rendered Markdown, JetBrains Mono, surface-canvas)  │   │
│  │                                                       │   │
│  │  Content streams in here...                           │   │
│  │  ▊                                                    │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Components

**`instruction-input.tsx`** — Client component

- Textarea with placeholder: "Enter your writing instruction..."
- Auto-resize height
- Inter font (UI input, not AI content)
- Disabled during generation

**`generate-button.tsx`** — Client component

- Primary button (brand-accent background)
- Shows "Generate" idle → "Generating..." with loading state during stream
- Disabled when instruction is empty or generation in progress

**`output-stream.tsx`** — Client component

- Renders streaming Markdown via `react-markdown`
- JetBrains Mono font (AI-generated content boundary)
- `surface-canvas` background
- Empty state: hidden or subtle placeholder
- Shows content as it streams in

### Data Flow

```
page.tsx (Server Component)
  │
  ├─ Reads seed article slug (hardcoded or from config)
  ├─ Reads article source.md (for display context, optional)
  │
  └─ Renders <Workspace slug={slug} />

Workspace (Client Component)
  │
  ├─ instruction state (textarea)
  ├─ useCompletion() from @ai-sdk/react
  │   api: /api/articles/[slug]/generate
  │   body: { instruction }
  │
  ├─ Generate button → trigger completion
  └─ Output area → displays streaming completion text
```

## 9. Seed Data

### `data/config.json`

```json
{
  "models": {
    "writing": {
      "provider": "anthropic",
      "model": "claude-sonnet-4-5"
    },
    "analysis": {
      "provider": "openai",
      "model": "gpt-4o-mini"
    }
  },
  "language": "zh"
}
```

### `data/profiles/default.md`

```yaml
---
name: default
description: Default channel profile
---
You are a professional content writer. You produce clear, well-structured articles that inform and engage readers. Your writing is concise, evidence-based, and accessible to a general audience.
```

### `data/styles/default/active.md`

```yaml
---
name: default
version: v1
description: Default writing style
---

## Tone
Clear, direct, professional. Avoid jargon unless the audience expects it.

## Structure
- Open with the key insight or hook
- Use short paragraphs (3-4 sentences max)
- Include subheadings for sections over 200 words
- End with a clear takeaway or call to reflection

## Language
- Active voice preferred
- Concrete over abstract
- Show, don't just tell — use examples and analogies
```

### `data/articles/seed-article/`

**`meta.md`:**

```yaml
---
title: "Seed Article"
slug: "seed-article"
language: "zh"
status: "draft"
styleRef: null
styleVersion: ""
createdAt: "2026-04-28T00:00:00Z"
updatedAt: "2026-04-28T00:00:00Z"
---
```

**`tree.json`:**

```json
{
  "rootNode": null,
  "bestNode": null,
  "latestNode": null,
  "nodes": {}
}
```

**`source.md`:**

```yaml
---
type: dehydrated
extractedAt: "2026-04-28T00:00:00Z"
---
## Core Ideas
- AI-assisted writing tools are shifting from replacement to augmentation
- The most effective tools preserve the writer's voice while enhancing output quality
- Evaluation feedback loops allow style to evolve with usage

## Key Arguments
- Writers need control, not autopilot — the tool should amplify intent, not override it
- Material-driven generation (from research/sources) produces higher quality than prompt-only generation
- Branching exploration lets writers discover unexpected angles without losing their main thread

## Facts & Data Points
- Professional writers report spending 60% of time on research and organization, 40% on actual writing
- Tools that provide structured feedback improve revision quality by measurable margins

## Entities
- CyberInk, AI writing tools, content creation workflow
```

## 10. Key Design Decisions

| Decision                         | Choice                                  | Rationale                                                                                    |
| -------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| Tailwind v4                      | CSS-first `@theme` config               | No tailwind.config.ts; tokens defined in globals.css                                         |
| shadcn/ui                        | Wraps Radix, rethemed with token system | Pre-built primitives, less boilerplate than raw Radix                                        |
| Prompt Builder is pure function  | No LLM calls, deterministic             | Testable, predictable, easy to debug prompt issues                                           |
| Profile + style in system prompt | Source + instruction in user message    | Stable context vs. varying context separation                                                |
| `useCompletion` for streaming    | Vercel AI SDK client hook               | Handles streaming protocol, loading states, error handling                                   |
| `styleRef: null` on creation     | Not "default"                           | No style system yet; null signals "no style selected"                                        |
| Seed article hardcoded           | Single preset workspace                 | Phase 1 proves generation, not article management                                            |
| No app shell                     | Workspace page only                     | Shell + dashboard in `phase-ui-shell-dashboard` (after Phase 3); Phase 1 is generation-first |
| Language in config.json          | Global default, not per-article         | Matches user's intent for config.json as settings persistence                                |
| 409 on re-generate               | Block if rootNode exists                | Phase 2+ handles branching/regeneration; Phase 1 is one-shot                                 |

## 11. What This Phase Does NOT Build

- No dashboard or article list page (`phase-ui-shell-dashboard`, after Phase 3)
- No article CRUD UI (create/delete)
- No app shell (top nav, sidebar) (`phase-ui-shell-dashboard`, after Phase 3)
- No dehydration engine (source.md is pre-filled)
- No evaluation or scoring
- No branching or optimize
- No style regeneration (seed style only)
- No settings UI (config.json edited manually)
- No theme toggle UI (dark theme default, provider wired up for future)

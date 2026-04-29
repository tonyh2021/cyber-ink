# Phase 1 — Generation Pipeline: Tasks

## Task 1: Project Scaffolding

**Status:** pending

Initialize the Next.js project and install all dependencies.

### Steps

1. `pnpm create next-app` with App Router, TypeScript, Tailwind CSS v4, ESLint
2. Initialize shadcn/ui (`pnpm dlx shadcn@latest init`)
3. Install production deps:
   - `ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/react` (Vercel AI SDK)
   - `gray-matter` (Markdown frontmatter)
   - `zod` (validation)
   - `nanoid` (ID generation)
   - `next-themes` (theme switching)
   - `react-markdown` (rendering)
4. Configure `tsconfig.json` path aliases (`@/` → `src/`)
5. Configure `.env` with placeholder keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `TAVILY_API_KEY`
6. Add `.env` to `.gitignore`

### Acceptance

- `pnpm dev` starts without errors
- `pnpm build` succeeds
- `pnpm lint` passes
- shadcn/ui components can be added via CLI

---

## Task 2: Design System — CSS Tokens & Theme

**Status:** pending

Implement the full DESIGN.md token system using Tailwind v4's CSS-first configuration.

### Steps

1. Create `src/app/globals.css`:
   - `@import "tailwindcss"`
   - `@theme` block mapping CSS variables to Tailwind utilities (colors, radius, fonts)
   - `[data-theme="dark"]` and `[data-theme="light"]` blocks with all DESIGN.md tokens
2. Load fonts in root layout via `next/font/google` (Inter + JetBrains Mono)
3. Set up `next-themes` ThemeProvider in root layout with `attribute="data-theme"`, `defaultTheme="dark"`
4. Create `src/lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)

### Acceptance

- All DESIGN.md tokens available as CSS variables
- Tailwind utility classes reference the token system (`bg-surface-root`, `text-brand-accent`)
- Fonts load correctly: Inter for UI, JetBrains Mono for content
- Dark theme applied by default

---

## Task 3: Seed Data Files

**Status:** pending

Create the `/data/` directory structure with all seed files.

### Steps

1. Create directory structure:
   ```
   data/
     config.json
     profiles/default.md
     styles/default/active.md
     articles/seed-article/
       source.md
       meta.md
       tree.json
       nodes/
       evaluation/
   ```
2. Write all seed files per design doc §9
3. Add `data/articles/` and `data/styles/` to `.gitignore` (user content)
4. Commit `data/config.json`, `data/profiles/default.md` (seed data, tracked)

### Acceptance

- All seed files exist with correct content
- `config.json` has models + language
- `source.md` has pre-filled dehydrated material
- `tree.json` has null rootNode/bestNode/latestNode
- `.gitignore` excludes user-generated content but allows seed files

---

## Task 4: Filesystem Helpers & Types

**Status:** pending

Build the filesystem access layer and shared types.

### Steps

1. Create `src/types/index.ts` with all types from design doc §4:
   - `ArticleMeta`, `ArticleTree`, `TreeNode`, `ArticleDetail`
   - `EvaluationScores`, `AppConfig`, `GenerateInput`
   - Zod schema for `GenerateInput`
2. Create `src/lib/data.ts` with:
   - `DATA_DIR` constant
   - `readMarkdown`, `writeMarkdown` (gray-matter)
   - `readJson`, `writeJson`
   - `ensureDir`, `removeDir`, `listDirs`, `listFiles`, `exists`
3. Create `src/lib/config.ts`:
   - `getConfig()`: read and parse `/data/config.json`

### Acceptance

- All types compile without errors
- Filesystem helpers work with `/data/` directory
- `readMarkdown` correctly parses gray-matter frontmatter
- `getConfig()` returns typed AppConfig
- Path traversal outside `/data/` is prevented

---

## Task 5: Prompt Builder

**Status:** pending

Implement deterministic system prompt assembly.

### Steps

1. Create `src/lib/prompt-builder.ts`:
   - `buildPrompt(input: { profile, style, source, instruction, language })` → `{ systemPrompt, userMessage }`
   - System prompt: profile section + style section + output rules (language, Markdown format)
   - User message: source material + instruction
2. Profile and style content read from filesystem (passed in, not read inside)
3. Language comes from config.json (passed in)

### Acceptance

- Given profile + style + source + instruction + language, produces deterministic output
- System prompt contains profile and style sections
- User message contains source material and instruction
- Language appears in output rules section
- Pure function — no side effects, no fs reads

---

## Task 6: Generation API

**Status:** pending

Wire up the streaming generation endpoint.

### Steps

1. Create `src/app/api/articles/[slug]/generate/route.ts`:
   - `POST` handler
   - Validate body with Zod (`{ instruction: string }`)
   - Read config.json, profile, style, source.md
   - Check tree.json — 409 if rootNode already exists
   - Call Prompt Builder
   - `streamText()` via Vercel AI SDK with config model
   - `onFinish`: save `nodes/v1.md`, update `tree.json`
   - Return streaming response
2. Error handling: 400, 404, 409, 500

### Acceptance

- `POST /api/articles/seed-article/generate` with `{ instruction: "..." }` returns streaming response
- After stream completes, `nodes/v1.md` exists with generated content
- `tree.json` updated with rootNode: "v1"
- Second call returns 409
- Missing instruction returns 400
- Nonexistent slug returns 404

---

## Task 7: Workspace Page

**Status:** pending

Build the minimal workspace UI for the seed article.

### Steps

1. Add shadcn/ui components: Button, Textarea, Card
2. Create `src/components/workspace/instruction-input.tsx`:
   - Textarea with placeholder
   - Auto-resize height
   - Disabled during generation
3. Create `src/components/workspace/generate-button.tsx`:
   - Primary button (brand-accent)
   - Loading state during generation
   - Disabled when empty instruction or generating
4. Create `src/components/workspace/output-stream.tsx`:
   - Renders streaming Markdown via `react-markdown`
   - JetBrains Mono font, surface-canvas background
   - Hidden when no content
5. Create `src/app/page.tsx`:
   - Server Component: reads seed article slug
   - Renders `<Workspace slug="seed-article" />`
6. Create `src/components/workspace/workspace.tsx`:
   - Client Component
   - `useCompletion()` from `@ai-sdk/react`
   - Wires instruction → generate → output stream

### Acceptance

- Page loads with instruction textarea and generate button
- Enter instruction → click Generate → content streams in
- Markdown rendered correctly in output area
- Button shows loading state during generation
- Generated content persisted to `nodes/v1.md`
- Dark theme applied correctly
- JetBrains Mono for generated content, Inter for UI

---

## Dependency Graph

```
Task 1 (scaffolding)
  │
  ├─→ Task 2 (CSS tokens & theme)
  │
  ├─→ Task 3 (seed data)
  │
  └─→ Task 4 (filesystem helpers & types)
        │
        └─→ Task 5 (prompt builder)
              │
              └─→ Task 6 (generation API)
                    │
                    └─→ Task 7 (workspace page)
                          ↑
                    Task 2 (also needed)
```

**Parallel after Task 1:** Tasks 2, 3, 4 can run in parallel.
**Sequential chain:** Task 4 → 5 → 6 → 7.
**Task 7 merges:** needs Task 2 (theme/tokens) + Task 6 (API).

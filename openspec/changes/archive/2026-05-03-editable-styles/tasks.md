## Tasks

### 1. Style defaults and types ✅

Define `StoredStyles` interface in `src/types/index.ts` and create `src/lib/style-defaults.ts` with hardcoded default values for all four style items.

**Files**: `src/types/index.ts`, `src/lib/style-defaults.ts` (new)

---

### 2. StylesProvider and `useStyles` hook ✅

Create `StylesProvider` client component that wraps the app in `layout.tsx`. On mount: check localStorage → if empty, seed from SSR props (passed from layout server component) → if still empty, use hardcoded defaults → write to localStorage → render children.

Create `useStyles()` hook that reads/writes localStorage only. No seed logic — Provider guarantees data is ready. Exposes `styles` and update functions (no `loaded` flag needed).

Update `layout.tsx` (server component) to read `/data/` files and pass seed props to `StylesProvider`.

**Files**: `src/components/styles-provider.tsx` (new), `src/hooks/use-styles.ts` (new), `src/app/layout.tsx`

---

### 3. Editable Styles page ✅

Rewrite `styles-page.tsx` to use `useStyles()` hook. Each section (Profile, Instruction, Polish Prompt, References) gets view/edit toggle with textarea, Save/Cancel buttons. Profile only exposes `content` for editing (name/description not editable). References UI is a flat list (groups merged), with Add/Delete for individual articles.

`page.tsx` becomes a thin server component shell — no data fetching (seeding handled by StylesProvider in layout).

**Files**: `src/components/styles/styles-page.tsx`, `src/app/styles/page.tsx`

---

### 4. Generate API accepts style data ✅

Add `profile`, `commonInstruction`, `references` as optional fields to `GenerateInputSchema`. When present, use them in `buildPrompt()` instead of reading from filesystem. Filesystem fallback permanently retained.

**Files**: `src/types/index.ts`, `src/app/api/articles/[slug]/generate/route.ts`

---

### 5. Polish round API accepts polishPrompt ✅

Add optional `polishPrompt` field to the polish round request body. When present, use it instead of reading `polish-prompt.md`. Filesystem fallback permanently retained.

**Files**: `src/app/api/articles/[slug]/polish/round/route.ts`

---

### 6. Workspace sends style data on generate/polish ✅

Update workspace component to read styles from `useStyles()` and include them in the generate and polish/round request bodies. References are sent as a flat array (all groups merged).

**Files**: `src/components/workspace/workspace.tsx`

---

### 7. New article warning for empty styles ✅

When creating a new article, check localStorage styles. Show dismissible warning toast if profile content or instruction is empty.

**Files**: `src/components/workspace/workspace.tsx` (or relevant new-article component)

---

### 8. Import/Export for style items ✅

Each style section gets export (download `.md` file) and import (file picker, read `.md`, update localStorage) controls. Format matches `/data/` originals: Profile exports with YAML frontmatter; Instruction, Polish Prompt, and References export as plain `.md`. References support per-article export and bulk import (multiple `.md` files).

**Files**: `src/components/styles/styles-page.tsx`

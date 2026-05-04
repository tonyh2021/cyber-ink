## Architecture

### Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  Server (SSR)                                            │
│  ┌──────────────┐                                        │
│  │  layout.tsx   │─── reads /data/ files ──► seed props  │
│  └──────────────┘                                        │
└────────────────────────────────┬─────────────────────────┘
                                 │ props
┌────────────────────────────────▼─────────────────────────┐
│  Browser                                                 │
│                                                          │
│  ┌────────────────────────────────────────────┐          │
│  │  StylesProvider (app-level client component)│          │
│  │  - checks localStorage                     │          │
│  │  - if empty → seed from SSR props           │          │
│  │  - if still empty → use hardcoded defaults  │          │
│  │  - writes to localStorage, then ready       │          │
│  └──────────────────┬─────────────────────────┘          │
│                     │ children render after ready         │
│                     ▼                                     │
│  ┌──────────────┐  read/   ┌───────────────────┐         │
│  │  Styles Page  │◄─write─►│   localStorage     │         │
│  │  (editable)   │         │   "cyberink:styles" │         │
│  └──────────────┘          │                     │         │
│                            │  { profile,         │         │
│  ┌──────────────┐  read    │    instruction,     │         │
│  │  Workspace    │◄───────►│    polishPrompt,    │         │
│  │  (generate/   │         │    references }     │         │
│  │   polish)     │         └───────────────────┘         │
│  └──────┬───────┘                                        │
│         │ body includes style data                       │
└─────────│────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│  Server (API)                                            │
│                                                          │
│  POST /api/articles/[slug]/generate                      │
│    body: { instruction, source,                          │
│            profile?, commonInstruction?,                  │
│            references? }                                 │
│    (filesystem fallback if omitted)                      │
│                                                          │
│  POST /api/articles/[slug]/polish/round                  │
│    body: { instruction, quote?,                          │
│            polishPrompt? }                               │
│    (filesystem fallback if omitted)                      │
└─────────────────────────────────────────────────────────┘
```

### localStorage Schema

Single key: `cyberink:styles`

```typescript
interface StoredStyles {
  profile: {
    name: string;
    description: string;
    content: string;
  };
  instruction: string;
  polishPrompt: string;
  references: Array<{
    groupName: string;
    articles: Array<{
      name: string;
      filename: string;
      content: string;
    }>;
  }>;
}
```

### App-Level StylesProvider

No dedicated seed API. The root `layout.tsx` server component reads `/data/` files at SSR time and passes seed props to a `StylesProvider` client component that wraps the entire app. On first load, the provider detects empty localStorage, seeds it from the SSR props (or hardcoded defaults if props are empty), and marks itself ready before rendering children. This guarantees localStorage is populated before any page (Styles or Workspace) mounts.

### Hardcoded Defaults

When both localStorage and SSR props are empty/null:

```typescript
const STYLE_DEFAULTS: StoredStyles = {
  profile: {
    name: "default",
    description: "",
    content: "You are a professional content writer.",
  },
  instruction: "Write in a clear, engaging style. Keep paragraphs short and punchy.",
  polishPrompt: `You are a writing polish assistant.

- Output the complete article. Never omit, summarize, or abbreviate any section.
- Only modify the paragraphs that the user's instruction explicitly targets.
- All untouched paragraphs must be preserved exactly as-is, character for character.
- Do not add any commentary, explanation, or notes before or after the article.
- Maintain the original markdown formatting and structure.
- Before the article, output a brief one-sentence summary of what you changed, wrapped between --- delimiters on their own lines. Then output the complete article.
- Preserve the author's voice and tone.
- Make minimal, precise changes that address the instruction.`,
  references: [],
};
```

### Styles Hook

`useStyles()` — shared hook for both Styles page and Workspace. Reads from localStorage only — seeding is handled by `StylesProvider` at app level.

```typescript
function useStyles(): {
  styles: StoredStyles;
  updateProfile: (profile: StoredStyles["profile"]) => void;
  updateInstruction: (instruction: string) => void;
  updatePolishPrompt: (polishPrompt: string) => void;
  updateReferences: (references: StoredStyles["references"]) => void;
}
```

- On mount: read localStorage (guaranteed populated by StylesProvider)
- Every update writes to localStorage immediately
- No `loaded` flag needed — StylesProvider ensures data is ready before children render

## Component Design

### Styles Page Layout

```
┌─────────────────────────────────────────────────┐
│  Styles                                         │
│  Configure your writing style                   │
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ Profile                              [Edit] ││
│  │ ┌─────────────────────────────────────────┐ ││
│  │ │ textarea (content only)                 │ ││
│  │ └─────────────────────────────────────────┘ ││
│  │                            [Cancel] [Save]  ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ Instruction                          [Edit] ││
│  │ ┌─────────────────────────────────────────┐ ││
│  │ │ textarea                                │ ││
│  │ └─────────────────────────────────────────┘ ││
│  │                            [Cancel] [Save]  ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ Polish Prompt                        [Edit] ││
│  │ ┌─────────────────────────────────────────┐ ││
│  │ │ textarea                                │ ││
│  │ └─────────────────────────────────────────┘ ││
│  │                            [Cancel] [Save]  ││
│  └─────────────────────────────────────────────┘│
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ References                   [Add Reference]││
│  │ ┌───────────────────────────────────┐       ││
│  │ │ 1.md                  [Edit][Del] │       ││
│  │ │ preview text...                   │       ││
│  │ └───────────────────────────────────┘       ││
│  │ ┌───────────────────────────────────┐       ││
│  │ │ 2.md                  [Edit][Del] │       ││
│  │ └───────────────────────────────────┘       ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

Each section has two modes:
- **View mode**: displays content as `<pre>` (current behavior), with an [Edit] button
- **Edit mode**: replaces `<pre>` with `<textarea>`, shows [Cancel] and [Save] buttons

Profile only exposes `content` for editing. `name` and `description` are retained in data but not editable in UI.

### Edit Behavior

- [Edit] → switch to textarea, pre-filled with current value
- [Save] → write to localStorage via `useStyles()`, switch back to view mode
- [Cancel] → discard edits, switch back to view mode
- No auto-save while typing — explicit save only

### Import/Export

Each style item can be exported/imported as a standalone `.md` file matching the `/data/` file format:

- **Profile**: `.md` with YAML frontmatter (name, description) + body content
- **Instruction**: plain `.md`
- **Polish Prompt**: plain `.md`
- **References**: one `.md` per article

Export: browser download of the `.md` file. Import: file picker, reads `.md`, updates localStorage.

Each section has an export icon and an import icon alongside the [Edit] button. References have per-article export and a bulk import (multiple `.md` files).

## API Changes

### `POST /api/articles/[slug]/generate`

Add optional fields to `GenerateInputSchema`:

```typescript
export const GenerateInputSchema = z.object({
  instruction: z.string().min(1),
  source: z.string().optional(),
  // New: style data from client
  profile: z.string().optional(),
  commonInstruction: z.string().optional(),
  references: z.array(z.string()).optional(),
});
```

When these fields are present in the request body, use them directly instead of reading from the filesystem. If omitted, the API falls back to filesystem reads. This dual-path is **permanent** — filesystem fallback is retained for non-browser clients and tests.

References are sent as a flat array (all groups merged) from the client. The per-article `styleRef` field in `meta.json` is deprecated — new articles set it to `null`.

### `POST /api/articles/[slug]/polish/round`

Add optional field:

```typescript
body: {
  instruction: string;
  quote?: string;
  // New
  polishPrompt?: string;
}
```

When `polishPrompt` is present, use it instead of reading `polish-prompt.md`. Filesystem fallback permanently retained.

## Article Creation Warning

In the workspace's new-article flow, after reading styles from localStorage:
- If `profile.content` is empty string → show warning toast: "Profile is not configured. Generation quality may be affected."
- If `instruction` is empty string → show warning toast: "Writing instruction is not configured."
- Warnings are dismissible, do not block article creation.

## Styles Page Conversion

The current Styles page is a server component that reads files at request time. It becomes a client component since all data comes from localStorage. The `page.tsx` server component becomes a thin shell that renders the client component. Seeding is handled at app level by `StylesProvider` in `layout.tsx`, not per-page.

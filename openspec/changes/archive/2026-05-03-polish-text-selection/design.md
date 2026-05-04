## Context

Polish mode is a two-panel layout: PolishDialog (left, conversation) and content canvas (right, OutputStream or PolishDiff). Users type instructions in the dialog textarea and submit a polish round that rewrites the full article. There is no mechanism to reference a specific passage from the canvas — users must describe what they mean in words.

The OutputStream renders markdown via `react-markdown` into standard HTML DOM (read-only, not contentEditable). The PolishDialog renders user messages as plain text (`<p>` with `text-[13px]`), not markdown.

## Goals / Non-Goals

**Goals:**
- Let users select text in the OutputStream canvas and quote it into their next polish instruction
- Display quoted text as a visually distinct block in the conversation thread
- Pass quoted context to the AI so it knows which passage the user is referencing
- Zero breaking changes — quote is optional everywhere

**Non-Goals:**
- Inline editing / contentEditable on the canvas
- Selection support in diff mode (PolishDiff uses react-diff-viewer DOM, not worth adapting)
- Persistent highlights or annotations on the canvas
- Partial-article output from the AI (still full-article rewrite per round)

## Decisions

### 1. Selection detection: `mouseup` listener on OutputStream container

Listen for `mouseup` on the canvas `<div>` wrapping OutputStream. On fire, read `window.getSelection()`. If the selection is non-empty and fully contained within the OutputStream DOM subtree, show the popover. Dismiss on any click outside or on new selection collapse. Disabled when `polishLoading` is true (streaming in progress).

**Why not a custom hook with `selectionchange`?** `selectionchange` fires on every cursor move (high frequency). `mouseup` is sufficient — we only care about the moment the user finishes selecting. A lightweight `useTextSelection` hook wrapping this keeps it clean.

### 2. Popover: minimal floating element positioned at selection range

Use `Range.getBoundingClientRect()` to position a small absolute-positioned element above the selection midpoint. Contains a single "Quote" button (with a quote icon). No external popover library needed — hand-positioned `div` with `position: fixed` relative to viewport coords from the range rect.

**Why fixed positioning?** The canvas scrolls (`overflow-y-auto`), so `absolute` within the scroll container would shift. `fixed` + viewport coords from `getBoundingClientRect()` stays pinned to the visual selection position. Dismiss on any click outside the popover or on canvas scroll (scroll invalidates the fixed position — re-selecting is trivial).

### 3. Quote state: `polishQuote` in Workspace, passed down via props

Add `polishQuote: string | null` state to Workspace alongside existing polish states. Flow:

```
SelectionPopover (canvas)
  → calls onQuote(text)
    → workspace sets polishQuote
      → PolishDialog receives quote prop
        → renders preview bar above textarea
        → on send: includes quote in handler
        → workspace clears polishQuote after send
```

### 4. Quote storage: `quote` field on PolishHistoryEntry

Add optional `quote?: string` to `PolishHistoryEntry`. Stored in `history.json` on the user entry. This keeps quote structured data — no parsing needed at render time.

**Alternative considered:** Embed quote as markdown `> ` prefix in the `content` string. Rejected because it conflates display and data, and user messages currently render as plain text — adding markdown parsing just for this is unnecessary.

### 5. AI instruction assembly: concatenate at API layer

The polish round API receives `{ instruction, quote? }`. Before passing to `buildPolishPrompt`, concatenate:

```
> {quote line 1}
> {quote line 2}
> ...

{instruction}
```

Each line of the quote is prefixed with `> ` to produce a valid markdown blockquote (`quote.split('\n').map(l => '> ' + l).join('\n')`). This ensures multi-line selections are treated as a single quoted block by the AI, not as instruction text. Markdown blockquote is language-neutral — works regardless of whether the user writes instructions in Chinese, English, or any other language. No changes to `buildPolishPrompt` itself.

### 6. Dialog rendering: conditional quote block above user message text

In the `rounds.map()` render of PolishDialog, check if the history entry has a `quote` field. If so, render a left-border-accented block before the instruction text:

```
┌─ User ──────────────────────────┐
│ ┃ quoted text here               │  ← border-l-2 border-brand-accent, text-text-secondary
│ ┃ second line...                 │     line-clamp-3, hover shows full quote in popover
│                                  │
│ instruction text here            │  ← normal text-text-primary
└──────────────────────────────────┘
```

Long quotes are truncated to 3 lines (`line-clamp-3`). On hover, a popover displays the full quote text using the same left-border-accented block style, just without the line clamp.

### 7. Input area quote preview: dismissible bar above textarea

When `polishQuote` is set, render a compact bar above the textarea showing truncated quote text + an × dismiss button. This gives the user visibility and control before sending.

## Risks / Trade-offs

- **[Selection across formatted elements]** → User may select across `<strong>`, `<em>`, `<code>` etc. `window.getSelection().toString()` strips formatting and returns plain text, which is fine — quote is plain text context, not markdown source.
- **[Popover positioning edge cases]** → Selection near viewport edges may cause popover clipping. Mitigation: clamp position to stay within canvas bounds, or flip to below selection when near top.
- **[Long selections]** → User selects a very long passage. The quote preview in the input area should truncate with ellipsis. The full quote is still sent to the AI.

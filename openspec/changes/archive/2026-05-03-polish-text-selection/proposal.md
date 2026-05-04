## Why

Polish mode currently operates at the full-article level — users type instructions in the dialog and the AI rewrites the entire piece. When users want to refine a specific sentence or paragraph, they must manually describe which part they mean. Adding text selection with quote-to-instruct lets users point at exactly what they want changed, reducing ambiguity and making polish conversations more precise.

## What Changes

- Users can select text in the polish content canvas (OutputStream, non-diff mode) and see a popover with a "quote" action
- Clicking the action captures the selected text as a quote attached to the next polish instruction
- The polish dialog input area shows a dismissible quote preview above the text input
- User messages in the conversation thread render the quote as a visually distinct blockquote (left border accent)
- The polish round API accepts an optional `quote` field, stored in history and concatenated into the AI instruction
- `PolishHistoryEntry` gains an optional `quote` field for structured storage

## Capabilities

### New Capabilities
- `text-selection-quote`: Text selection popover on polish canvas and quote-aware polish dialog (selection detection, popover UI, quote state management, dialog rendering, API integration)

### Modified Capabilities

## Impact

- **Types**: `PolishHistoryEntry` in `src/types/index.ts` — new optional `quote` field
- **API**: `POST /api/articles/[slug]/polish/round` — accepts `quote` in request body, persists to history, concatenates into AI instruction
- **Components**: `workspace.tsx` (quote state), `polish-dialog.tsx` (quote preview + message rendering), `output-stream.tsx` or parent container (selection event handling)
- **New files**: `useTextSelection` hook, `SelectionPopover` component
- **No breaking changes** — quote is optional everywhere, existing sessions unaffected

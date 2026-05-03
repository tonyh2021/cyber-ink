## 1. Type & API Changes

- [x] 1.1 Add optional `quote?: string` field to `PolishHistoryEntry` in `src/types/index.ts`
- [x] 1.2 Update polish round API (`src/app/api/articles/[slug]/polish/round/route.ts`) to accept `quote` in request body, concatenate into AI instruction, and persist quote in history entries

## 2. Selection Detection & Popover

- [x] 2.1 Create `useTextSelection` hook (`src/hooks/use-text-selection.ts`) — listens for `mouseup` on a container ref, returns `{ text, rect, clear }` when selection is non-empty; dismisses on outside click
- [x] 2.2 Create `SelectionPopover` component (`src/components/workspace/polish/selection-popover.tsx`) — fixed-positioned popover near selection rect with a "Quote" button; calls `onQuote(text)` on click

## 3. Workspace State Wiring

- [x] 3.1 Add `polishQuote` state to Workspace (`src/components/workspace/workspace.tsx`), pass `onQuote` callback to canvas area and `quote`/`onClearQuote` to PolishDialog; include quote in `handlePolishRound` send logic and clear after send
- [x] 3.2 Mount `SelectionPopover` in the canvas container (non-diff mode only), wired to set `polishQuote`

## 4. Polish Dialog UI

- [x] 4.1 Add quote preview bar above textarea in PolishDialog input area — shows truncated quote text + × dismiss button; visible when `quote` prop is set
- [x] 4.2 Render quote block in conversation thread user messages — check `history[i].quote`, render border-l-2 accented block above instruction text; truncate to 3 lines (line-clamp-3) with hover popover for full text

## 5. Verification

- [ ] 5.1 Manual test: select text in OutputStream → popover appears → click Quote → preview bar shows → type instruction → send → conversation shows quote block + instruction → AI receives concatenated instruction with quote context
- [ ] 5.2 Manual test: dismiss quote via × button, dismiss popover via outside click, verify no popover in diff mode, verify session restore preserves quotes in history

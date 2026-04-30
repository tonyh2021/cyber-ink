# Phase 3 — Polish Mode: Tasks

- [ ] Task 1: Types & data helpers — Polish types, filesystem helpers for `.polish/` lifecycle
- [ ] Task 2: Polish prompt builder — Two-layer prompt assembly (hardcoded + configurable) with sliding window
- [ ] Task 3: Polish API — start, round, commit, discard, status endpoints
- [ ] Task 4: Polish UI — conversation view, instruction input, diff toggle, commit/discard dialog
- [ ] Task 5: Default polish-prompt.md — Ship a sensible default config file
- [ ] Task 6: Cleanup old branching plan — Remove or archive phase3-branching-evaluation

## Task Details

### Task 1: Types & data helpers

Add polish-related types and filesystem operations.

**Types** (`src/types/index.ts`):
- `PolishTarget` — `{ node: string }`
- `PolishHistoryEntry` — `{ role: "user" | "assistant", content: string }`
- `PolishStatus` — `{ active: true, node: string, original: string, previous: string | null, current: string | null, history: PolishHistoryEntry[] }` | `{ active: false }`
- `PolishCommitChoice` — `"original" | "previous" | "current"`

**Data helpers** (`src/lib/data.ts` or new `src/lib/polish-data.ts`):
- `initPolishSession(slug, node)` — create `.polish/` dir, snapshot node content to `original.md`, write `target.json`, init empty `history.json`
- `getPolishStatus(slug)` — read `.polish/` state or return `{ active: false }`
- `rotatePolishRound(slug, newContent)` — move `current.md` → `previous.md`, write new `current.md`
- `appendPolishHistory(slug, entries)` — append to `history.json`
- `commitPolish(slug, pick)` — read chosen file, overwrite target node `.md`, delete `.polish/`
- `discardPolish(slug)` — delete `.polish/`
- `getPolishHistory(slug)` — read `history.json`, return full array

**Acceptance:** All helpers work with filesystem. `initPolishSession` refuses if `.polish/` already exists. `commitPolish` correctly overwrites the target node's `.md` file preserving its frontmatter (update `generatedAt` or add `polishedAt`).

### Task 2: Polish prompt builder

New function `buildPolishPrompt` (in `src/lib/prompt-builder.ts` or new file):

**Input:**
- `original`: string (original article content)
- `history`: PolishHistoryEntry[] (full history)
- `currentInstruction`: string (this round's instruction)
- `polishPromptConfig`: string (from `polish-prompt.md`, may be empty)

**Output:**
- `systemPrompt`: string
- `messages`: Array<{ role: "user" | "assistant", content: string }>

**System prompt assembly:**
```
[Hardcoded rules — always first]
- You are a writing polish assistant.
- Output the complete article. Never omit, summarize, or abbreviate any section.
- Only modify the paragraphs that the user's instruction explicitly targets.
- All untouched paragraphs must be preserved exactly as-is, character for character.
- Do not add any commentary, explanation, or notes before or after the article.
- Maintain the original markdown formatting and structure.

[User-configurable polish-prompt.md — appended after]
{polishPromptConfig}
```

**Message assembly (3-round sliding window):**
1. First user message always contains the original article
2. Take last 3 rounds from history (each round = 1 user instruction + 1 assistant output)
3. If history has ≤3 rounds, include all
4. If history has >3 rounds, include only rounds (N-2), (N-1), N — but the original article is always in message 1
5. Append `currentInstruction` as the final user message

**Acceptance:** Window correctly slides. Original is always present in first message. Empty `polishPromptConfig` produces valid prompt with only hardcoded rules.

### Task 3: Polish API

Five endpoints under `/api/articles/[slug]/polish/`:

**`POST .../polish/start`**
- Body: `{ node: string }`
- Validate article exists, node exists in tree.json
- Call `initPolishSession` — return 409 if session already exists
- Return `{ status: "started", node }`

**`GET .../polish/status`**
- Call `getPolishStatus`
- Return full status (including content strings for original/previous/current and history)

**`POST .../polish/round`**
- Body: `{ instruction: string }`
- Validate active session exists
- Build prompt via `buildPolishPrompt` (read original, history, polish-prompt.md)
- Stream response (same pattern as generate — support mock provider)
- `onFinish`: rotate files (`rotatePolishRound`), append user instruction + AI output to history

**`POST .../polish/commit`**
- Body: `{ pick: "original" | "previous" | "current" }`
- Validate active session, validate pick (if "previous" but previous is null → 400)
- Call `commitPolish` — overwrite node, clean up `.polish/`
- Return `{ committed: true, node }`

**`POST .../polish/discard`**
- Call `discardPolish`
- Return `{ discarded: true }`

**Acceptance:** Full lifecycle works: start → round (×N) → commit. Start returns 409 on duplicate. Commit with "previous" on round 1 (no previous) returns 400. Discard cleans up without modifying node. Mock provider streams correctly.

### Task 4: Polish UI

Transform the workspace right panel when polish mode is active.

**Polish mode state:**
- Detect on page load via `GET .../polish/status` — if active, enter polish mode
- Track: `polishOriginal`, `polishPrevious`, `polishCurrent`, `polishHistory`, `diffMode` ("previous" | "original" | null)

**Components:**
1. **Polish toolbar** — replaces or overlays the version tab strip during polish. Shows "Polishing v2" label, diff toggle buttons, discard button
2. **Conversation view** — scrollable history of all rounds (instruction + AI response summary/preview). Not full article per round — condensed (e.g., show instruction + "Round N applied" or first line of change)
3. **Polish instruction input** — text input + submit button at bottom (similar to current instruction input)
4. **Content area** — when diff is off: shows current polish result (or original if no rounds yet). When diff is on: side-by-side diff via `react-diff-viewer-continued`
5. **Commit dialog** — modal with three radio options (Original / Previous / Current), each with a short preview. Apply button overwrites and exits polish mode. Previous option disabled if no previous exists (round 1).
6. **Discard confirmation** — simple confirm dialog

**Entry point:** InstructionBar polish icon button (message-square-text). Enabled when activeNode exists and no polish session active. Clicking starts a session on the current activeNode and transitions to polish mode UI.

**Acceptance:** Full round-trip works in UI. Diff toggle switches correctly between two comparison modes. Commit with each of the three options works. Page refresh restores polish state. Streaming output displays during a round.

### Task 5: Default polish-prompt.md

Create `data/instruction/polish-prompt.md` with a sensible default:

```markdown
---
description: Configurable polish assistant prompt
---

You are a meticulous writing editor. When refining text:
- Preserve the author's voice and tone
- Make minimal, precise changes that address the instruction
- Maintain consistency with the surrounding context
```

**Acceptance:** File exists. Polish prompt builder reads it. Deleting the file doesn't break polish (hardcoded rules still work).

### Task 6: Cleanup old branching plan

Archive `openspec/changes/phase3-branching-evaluation/` — move to `openspec/changes/archive/` with date prefix. The branching/optimize model is superseded by polish.

**Acceptance:** Old change is archived. No dangling references.

## Dependency Graph

```
Task 1 (types + helpers) ─→ Task 2 (prompt builder) ─→ Task 3 (API)
                                                            │
Task 5 (default config) ─────────────────────────────────→─┘
                                                            │
                                                       Task 4 (UI)

Task 6 (cleanup) — independent
```

Tasks 1 → 2 → 3 → 4 are sequential.
Task 5 can be done anytime before Task 3.
Task 6 is independent.

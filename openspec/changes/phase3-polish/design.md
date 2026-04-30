## Context

After Phase 2, the writing pipeline supports: create article → paste material → generate v1/v2/v3... (flat, max 5). The originally planned branching model (v2-a, v2-b variants) is replaced by a conversational polish mode — iterative, surgical, dialogue-driven refinement on any version.

Current state:
- Articles have `tree.json` tracking flat v-nodes (no children used)
- `/nodes/` contains `v1.md`, `v2.md`, etc.
- No optimize/branch API exists (was planned, never built)
- Workspace shows version tabs + content canvas
- `react-diff-viewer-continued` is in dependencies but unused

**Depends on:**
- Phase 2 (article CRUD, full workspace page, version generation)

## Goals / Non-Goals

**Goals:**
- Users can enter a polish session on any v-node and refine it through multi-round dialogue
- AI only modifies paragraphs the user's instruction targets; untouched text stays verbatim
- Users can compare current polish against previous round or original at any time
- Full conversation history is preserved for display; AI context is windowed to 3 rounds
- On apply, user chooses from three versions (original / previous / current) to overwrite the v-node
- Polish session survives page refresh via server-persisted ephemeral state

**Non-Goals:**
- No branching / variant nodes (v1-a, v2-b) — removed by design
- No auto-evaluation during polish (evaluation is a separate concern)
- No concurrent polish sessions on the same article
- No polish on the generate instruction or source material

## Decisions

### 1. Polish is transient ephemeral state, not version history

**Choice:** Polish iterations live in `.polish/` during the session and are fully cleaned up on apply or discard. No polish artifacts persist in the version tree.

```
/data/articles/{slug}/
  .polish/
    target.json       { "node": "v2" }
    original.md       v2 content snapshot at session start
    previous.md       last round's AI output (null on first round)
    current.md        latest AI output
    history.json      full conversation [{role, content, summary?}, ...]
```

**Why:** Polish is a refinement tool, not a versioning tool. The version strip stays clean (v1, v2, v3). Users who want to preserve a pre-polish state can generate a new version first.

**Lifecycle:**
```
Enter polish  →  snapshot v2 → original.md
                  create target.json, empty history.json
Round N       →  current.md → previous.md (rotate)
                  AI output → current.md
                  append to history.json
Page refresh  →  detect .polish/ → restore session
Apply         →  user picks original/previous/current
                  → overwrite v2.md → delete .polish/
Discard       →  delete .polish/ → no changes
```

### 2. Two-layer polish prompt

**Choice:** System prompt is assembled from two sources:

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Hardcoded rules (always prepended)          │
│  - Output the complete article, never omit sections  │
│  - Only modify paragraphs the instruction targets    │
│  - Untouched paragraphs must be preserved verbatim   │
│  - Do not add commentary, explanations, or notes     │
│  - Maintain the original markdown structure           │
├─────────────────────────────────────────────────────┤
│ Layer 2: User-configurable polish-prompt.md          │
│  - Role definition, tone preferences, domain rules   │
│  - Can be empty (hardcoded rules suffice alone)      │
│  - Located at data/instruction/polish-prompt.md      │
└─────────────────────────────────────────────────────┘
```

**Why hardcoded first:** Prevents user config from overriding critical behavioral constraints. The most common failure mode (AI rewriting untouched paragraphs) is addressed at the framework level.

### 3. AI context: original anchor + 3-round sliding window

**Choice:** The prompt sent to the AI always contains:

```
system:  [hardcoded rules] + [polish-prompt.md]

[user]   原文: {original.md}           ← always anchored
         修改: instruction (N-2)
[asst]   {output N-2}
[user]   修改: instruction (N-1)
[asst]   {output N-1}
[user]   修改: instruction N            ← current round
```

- `original.md` is always in the first user message so the AI knows the baseline
- Only the most recent 3 rounds are included in the prompt
- `history.json` stores all rounds (for UI conversation display)

**Why 3 rounds:** Each round includes a full article in the assistant message. At ~2-3k tokens per article, 3 rounds ≈ 10-15k tokens of conversation + system prompt. Keeps cost predictable while giving the AI enough trajectory context.

**Why always anchor original:** Without the original, after several rounds the AI loses sight of what "unchanged" means. The original is the invariant reference point.

### 4. No context inherited from generate

**Choice:** Polish prompt does NOT include profile, style, source material, references, or the generate instruction.

**Why:** The article itself is the product of all those inputs. Re-injecting them into polish would be redundant and potentially conflicting (e.g., style instructions might encourage the AI to rewrite "unchanged" paragraphs to better match style). Polish operates purely on "here's an article, change what I tell you to change."

### 5. API design

```
POST /api/articles/[slug]/polish/start
  body: { node: string }
  → 200: { status: "started", node: string }
  → 409: session already active
  Creates .polish/ with original.md snapshot

GET /api/articles/[slug]/polish/status
  → 200: { active: true, node, original, previous, current, history }
  → 200: { active: false }
  Used on page load to detect/restore session

POST /api/articles/[slug]/polish/round
  body: { instruction: string }
  → 200: streaming response (summary + delimiter + full article)
  Stream format: ---\nsummary\n---\narticle (summary wrapped between two --- delimiters)
  Frontend splits on second ---: content before → summary (conversation thread), content after → article (canvas)
  Fallback: if no delimiter found, treat entire output as article, leave summary empty
  Rotates current→previous, stores article as current.md
  Appends { role, content, summary } to history.json after stream completes

POST /api/articles/[slug]/polish/apply
  body: { pick: "original" | "previous" | "current" }
  → 200: { applied: true, node: string }
  Overwrites target node .md, deletes .polish/

POST /api/articles/[slug]/polish/discard
  → 200: { discarded: true }
  Deletes .polish/ without modifying node
```

All streaming follows the same pattern as generate (text stream response via Vercel AI SDK or mock provider).

### 6. Structured output: summary + article in one call

**Choice:** Each polish round returns both a change summary and the full article in a single streaming response, separated by a `---` delimiter.

```
---
Shortened paragraph 3, removed two redundant qualifiers.
---
The global race to regulate artificial intelligence...
(full article)
```

**Stream parsing:**
- Content before the second `---` → change summary (displayed in conversation thread)
- Content after the second `---` → full article (streamed to canvas)
- Fallback: if no delimiter found, treat entire output as article, leave summary empty

**Why single call:** Avoids a second API call for summary generation. The summary is short (one sentence), so it arrives almost instantly before the article starts streaming — the user gets immediate feedback in the conversation thread while the article renders progressively.

**Prompt rule added to hardcoded layer:**
```
Before the article, output a brief one-sentence summary of what you changed,
wrapped between --- delimiters on their own lines. Then output the complete article.
```

**History storage:** `history.json` entries gain a `summary` field alongside `role` and `content`. The summary is extracted from the stream; the article text goes into `content`.

### 7. Diff view: two toggle modes

**Choice:** When in polish mode, the content area can switch between:

| Mode | Left | Right |
|------|------|-------|
| Current ↔ Previous | previous.md | current.md |
| Current ↔ Original | original.md | current.md |

Uses `react-diff-viewer-continued` (already in dependencies). Default view is the rendered article (not diff); diff is toggled on explicitly.

### 8. One session per article

**Choice:** Only one polish session can be active per article at a time. Starting a new session while one exists returns 409. User must apply or discard first.

**Why:** Multiple concurrent sessions on different nodes would require conflict resolution if both touch overlapping content. Single-session keeps the model simple and matches the typical workflow (focus on one version at a time).

### 9. Polish entry point

**Choice:** The InstructionBar in the normal workspace view contains a polish icon button (message-square-text). Clicking it starts a polish session on the current activeNode.

**Preconditions:**
- An activeNode exists (at least one version has been generated)
- No polish session is already active for this article

**Behavior:**
- Click → calls `POST /api/articles/[slug]/polish/start` with `{ node: activeNode }`
- On success → UI transitions from normal workspace to polish mode (left panel becomes conversation dialog, right panel gains diff toggle toolbar)
- If session already exists (409) → UI enters polish mode with the existing session restored

**Button state:**
- Enabled: activeNode exists and no active polish session
- Disabled: no versions yet, or polish session already active (in which case the UI is already in polish mode)

**Design reference:** `design/cyber-ink.pen` frame "Workspace Page" → InstructionBar → polishBtn

### 10. Unified instruction input: embedded action button

**Choice:** The generate instruction area merges the text input and the Generate button into a single compact input box — matching the polishInputBox pattern used in polish mode.

**Before:** Three separate elements stacked vertically — "Instruction" label, text input box, and a right-aligned "Generate" text button below.

**After:** A single input box with placeholder text and a `sparkles` icon button positioned absolute in the bottom-right corner. The "Instruction" label is removed (placeholder text provides sufficient affordance).

| Input | Icon | Semantic |
|---|---|---|
| Polish input | `arrow-up` | Send refinement instruction |
| Generate input | `sparkles` | Generate new version from scratch |

**Why:** Both inputs serve the same interaction pattern (type instruction → trigger AI action). Unifying the visual structure reduces cognitive overhead and keeps the workspace compact. The distinct icons (`sparkles` vs `arrow-up`) differentiate the two actions clearly.

**Design reference:** `design/cyber-ink.pen` node `nouLT` (polishInputBox) as the structural template.

## Risks / Trade-offs

- **AI compliance with surgical edits:** LLMs may subtly rephrase "unchanged" paragraphs despite instructions. → Mitigation: hardcoded prompt rules + diff view lets users verify. Users can discard if AI rewrites too aggressively.

- **Lost polish work on browser crash:** Server state survives refresh, but if the user never applies and the `.polish/` directory is orphaned, it stays on disk. → Mitigation: on polish start, check for stale sessions; UI shows "resume or discard" on re-entry.

- **3-round window loses early context:** If the user made 8 rounds, rounds 1-5 are invisible to the AI. → Mitigation: original is always anchored, so the AI always knows the baseline. The window covers recent trajectory. For most editing sessions 3 rounds of context is sufficient.

## UX Contract

- Polish mode is a distinct UI state with a two-panel layout:
  - **Left panel (440px) → conversation dialog**: replaces the source/instruction panel. Contains header (Polish · node + article name), scrollable conversation thread (user instruction bubbles + AI response summaries), and instruction input with embedded send button
  - **Right panel → canvas + toolbar**: toolbar with centered diff toggle (Current / vs Previous / vs Original) and ghost-style "Apply" text button. Canvas shows polished article or side-by-side diff
- AI response blocks in the conversation thread are clickable — clicking one previews that round's output in the right canvas
- Selected AI message has accent-tinted background + left accent border to indicate active preview
- Diff toggle switches the canvas between rendered article view and side-by-side comparison (Original↔Current or Previous↔Current)
- Apply opens a modal with three radio options (Original / Previous Round / Current) with text preview for each
- Discard takes effect immediately with no confirmation
- If `.polish/` exists on page load, UI enters polish mode automatically with session restored
- Design reference: `design/cyber-ink.pen` frames "Workspace — Polish Mode", "Workspace — Polish Diff", "Workspace — Polish Apply"

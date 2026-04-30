## Why

After Phase 2, the only way to improve a draft is to generate a new version from scratch. The planned branching model (v2-a, v2-b variants) adds structural complexity without matching how writers actually refine — they iterate conversationally on specific paragraphs, not fork entire drafts. Users need a way to surgically polish a version through dialogue, compare changes, and apply the result back.

## What Changes

- Remove the planned optimize/branching system (v1-a, v2-b style nodes) — the version model stays flat: v1, v2, v3...
- Add a **polish mode** per version: a conversational, multi-round editing session that operates on a single version
- Polish is transient server state — stored in `.polish/` during the session, cleaned up on apply or discard
- AI context uses a sliding window (original + last 3 rounds) while full conversation history is preserved for display
- Polish prompt is two-layer: hardcoded safety rules + user-configurable `data/instruction/polish-prompt.md`
- On apply, user picks one of three versions (original / previous polish / current polish) to overwrite the target node

## Capabilities

### New Capabilities

- `polish-session`: Enter polish mode on any v-node. Creates `.polish/` working directory with original snapshot, starts a conversational editing session. Survives page refresh; one active session per article.
- `polish-round`: Each round sends user instruction + article to AI. AI returns a brief change summary (one sentence) wrapped between two `---` delimiters, followed by the full article with only instructed paragraphs changed (`---\nsummary\n---\narticle`). Content before the second `---` is the summary (displayed in conversation thread); content after is the article (streamed to canvas). Fallback: if no delimiter found, treat entire output as article, leave summary empty. Server rotates current→previous, stores new output as current. Both summary and full conversation history appended to history.json.
- `polish-prompt`: Two-layer system prompt — hardcoded rules (output full article, only modify instructed paragraphs, preserve untouched text verbatim, maintain markdown structure) + user-configurable polish-prompt.md. Hardcoded rules always prepended, cannot be overridden.
- `polish-diff`: Two diff comparison modes — Current ↔ Previous and Current ↔ Original. Uses existing react-diff-viewer-continued.
- `polish-apply`: Three-way choice (original / previous / current) → selected version overwrites the target v-node's .md file. Clears `.polish/` directory.
- `polish-discard`: Abandon session immediately (no confirmation), clear `.polish/`, no changes to the v-node.

### Modified Capabilities

- `branching` (from phase3-branching-evaluation proposal): **Removed entirely.** No v1-a/v2-b variant nodes. Version model stays flat.
- `optimize` (from phase3-branching-evaluation proposal): **Replaced by polish.** Iterative refinement happens through polish dialogue, not one-shot optimize.

## Impact

- **Code**: New API routes for polish session lifecycle (start, round, apply, discard, status). New UI for polish mode (left-panel conversation dialog, right-panel canvas with diff toggle, apply dialog). Prompt builder gains polish prompt assembly with structured summary+article output. Existing workspace UI modified: InstructionBar gains a polish entry button (`message-square-text` icon on activeNode); generate instruction area refactored into a unified input box with embedded `sparkles` action button (matching the polish input pattern).
- **APIs**: `POST /api/articles/[slug]/polish/start`, `POST .../polish/round`, `POST .../polish/apply`, `POST .../polish/discard`, `GET .../polish/status`
- **Dependencies**: No new dependencies
- **Data**: New `.polish/` ephemeral directory per article (target.json, original.md, previous.md, current.md, history.json). New `data/instruction/polish-prompt.md` config file.
- **Design**: Workspace adopts a layered depth model — NavSidebar > left panel > right panel, with each layer casting a right-side shadow onto the layer below. Shadows replace border separators for a softer visual hierarchy. In code, use CSS `z-index` to ensure correct stacking order so shadows render naturally without offset hacks.
- **Risk**: Low-medium — polish is isolated (ephemeral state, single session per article, clean apply/discard lifecycle). Main risk is AI compliance with "only change instructed paragraphs" — mitigated by hardcoded prompt rules + diff view letting users verify. Secondary risk is AI not following the summary+delimiter+article format — mitigated by fallback (treat entire output as article, leave summary empty).

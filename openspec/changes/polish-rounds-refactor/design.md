## Context

Polish mode is implemented (phase3-polish). Current storage uses rotation: `current.md` → `previous.md` on each round. This loses round history and forces a `hasPrevious` disabled state on Round 1.

## Goals / Non-Goals

**Goals:**
- Every round's output is preserved for the session lifetime
- "vs Previous" works on Round 1 (falls back to original)
- Apply modal can reference any round (future extensibility)

**Non-Goals:**
- No UI to browse arbitrary past rounds (just previous + original diffs)
- No change to LLM sliding window logic

## Decisions

### 1. Numbered round files replace rotation

**Before:**
```
.polish/
  target.json
  original.md
  previous.md       ← only last round
  current.md        ← latest round
  history.json
```

**After:**
```
.polish/
  target.json
  original.md
  history.json
  rounds/
    1.md            ← Round 1 output
    2.md            ← Round 2 output
    3.md            ← Round 3 output (latest)
```

**Derived values:**
```
current  = rounds/N.md           (N = total rounds)
previous = rounds/N-1.md         (N=1 → fallback to original.md)
```

**Why:** No data loss, natural alignment with `history.json` entries (round N ↔ history entry pair 2N-1, 2N), and `previous` becomes a derived concept rather than managed state.

### 2. `PolishStatus` type change

**Before:**
```ts
{
  active: true;
  node: string;
  original: string;
  previous: string | null;
  current: string | null;
  history: PolishHistoryEntry[];
}
```

**After:**
```ts
{
  active: true;
  node: string;
  original: string;
  rounds: string[];          // ordered round contents, may be empty
  history: PolishHistoryEntry[];
}
```

Frontend derives:
```ts
const current  = rounds.length > 0 ? rounds[rounds.length - 1] : null;
const previous = rounds.length > 1 ? rounds[rounds.length - 2] : original;
```

Note: when `rounds.length === 1`, `previous` falls back to `original` — this is the key behavioral change that makes "vs Previous" always available.

### 3. Remove `hasPrevious`

The `PolishToolbar` `hasPrevious` prop, its disabled state on the "vs Previous" button, and the workspace logic that computes it are all removed. The button is always enabled once a polish session has at least one round.

### 4. Diff logic update

| Mode | Left (old) | Right (new) |
|------|-----------|-------------|
| vs Previous | `previous` (derived: round N-1, or original if N=1) | `current` (round N) |
| vs Original | `original` | `current` (round N) |

### 5. Apply modal choices

Three choices remain, but derive from rounds:
- **Original**: `original.md`
- **Previous Round**: `rounds/N-1.md`, or hidden if only 1 round
- **Current**: `rounds/N.md`

### 6. `savePolishRound` replaces `rotatePolishRound`

```ts
async function savePolishRound(slug: string, content: string): Promise<number> {
  // count existing rounds, write rounds/{next}.md, return round number
}
```

No rotation, no overwrite. Append-only within the session.

## Risks / Trade-offs

- **Disk usage**: Each round stores a full article copy. At ~5KB per article and ≤10 rounds typical, this is ~50KB per session — negligible, and cleaned up on apply/discard.
- **Round file count**: No cap enforced. If needed later, can add a max-rounds limit, but unlikely to matter for ephemeral sessions.

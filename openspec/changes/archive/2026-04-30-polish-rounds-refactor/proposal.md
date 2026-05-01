## Why

The current polish storage model (`previous.md` + `current.md` with rotation) loses all rounds except the last two, and disables "vs Previous" on Round 1 even though comparing against the original is meaningful. The data model should preserve every round and treat "previous" as a derived concept.

## What Changes

- Replace `previous.md` / `current.md` with numbered round files (`rounds/1.md`, `rounds/2.md`, ...)
- Remove `rotatePolishRound` — replace with `savePolishRound` that appends a new round file
- "vs Previous" always works: Round 1 falls back to `original.md`, Round N>1 compares against Round N-1
- Remove `hasPrevious` prop from `PolishToolbar` and all callsites
- `PolishStatus` type drops `previous` / `current` fields, gains `rounds: string[]` (ordered round contents)
- Apply modal choices update: "Original" / "Previous Round" / "Current" derive from rounds array + original
- No change to LLM context — sliding window already reads from `history.json`, not from round files

## Capabilities

### Modified Capabilities

- `polish-session`: Storage layout changes from `previous.md` + `current.md` to `rounds/` directory
- `polish-diff`: "vs Previous" no longer disabled on Round 1; falls back to original
- `polish-apply`: Picks derive from rounds array instead of named files

## Impact

- **Code**: `polish-data.ts` (storage), `workspace.tsx` (state + diff logic), `polish-toolbar.tsx` (remove `hasPrevious`), `polish-apply-modal.tsx` (derive choices from rounds), `PolishStatus` type
- **Data**: `.polish/` layout changes — migration not needed (polish sessions are ephemeral)
- **Risk**: Low — polish is ephemeral state, no persistent data migration required

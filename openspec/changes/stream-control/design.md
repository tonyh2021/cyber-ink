## Context

Generation uses Vercel AI SDK's `useCompletion` hook (frontend) and `streamText` (backend). Currently only `completion`, `isLoading`, and `complete` are destructured — `stop` and `error` are ignored. The Generate button shows a spinner during loading but cannot be clicked to abort.

The backend generate route (`/api/articles/[slug]/generate/route.ts`) prunes old version files **before** streaming begins (lines 224–236), then persists the new version in `onFinish`. If the stream is aborted or fails, the old files are already deleted but the new file is never written.

## Goals / Non-Goals

**Goals:**
- Users can stop generation mid-stream; all state rolls back as if generation never started
- Stream errors display a top toast banner and roll back state
- Version pruning is safe: old files only deleted after new version is successfully written

**Non-Goals:**
- Persisting partial content on stop (explicitly rejected — stop = never happened)
- Retry button in error banner (user can just click Generate again)
- Stop support during polish rounds (separate concern, different stream)

## Decisions

### 1. Frontend rollback via pre-generate snapshot

Before calling `complete()`, save a snapshot of the state that `doGenerate` mutates:

```
snapshot = { nodes, activeNode, nodeContent[removedNode] }
```

On stop or error, restore from snapshot: remove pendingNode from nodes, restore activeNode, restore removed node's content if any. The instruction input is never cleared during generation (current behavior), so it naturally survives rollback. After rollback, focus the instruction input so the user can immediately edit and retry.

**Alternative considered:** Resetting individual state fields in the stop handler. Rejected because `doGenerate` does multiple mutations (add node, remove old node, set active) and tracking each independently is fragile.

### 2. Frontend onFinish must tolerate abort

`useCompletion`'s `onFinish` fires even after `stop()` is called (SDK source confirms it passes `isAborted` flag). This creates a race: the stop/rollback handler restores pre-generate state, then `onFinish` fires and tries to commit the (partial) completion.

**Guard:** The existing `onFinish` already checks `if (!pendingNodeRef.current) return`. The stop handler clears `pendingNodeRef` as part of rollback, so `onFinish` will early-return. This works IF rollback runs before `onFinish` — both are triggered by the same `stop()` call but rollback is synchronous while `onFinish` is async (end-of-stream callback). Implementation must verify this ordering; if needed, add an explicit `abortedRef` flag set by the stop handler and checked by `onFinish`.

### 2b. Stop button replaces Generate button

InstructionInput already receives `loading` prop. When `loading=true`, render a Square (stop icon) instead of Sparkles, wired to an `onStop` callback. Same button position, same size — just icon and color swap.

**Alternative considered:** Separate Stop button next to Generate. Rejected — clutters the UI for a mutually exclusive state.

### 3. Deferred pruning in onFinish (with abort guard)

Move the prune logic (lines 224–236 of generate route) into the `persistGeneratedNode` function that runs inside `onFinish`. Sequence becomes:

```
Request starts → build prompt → start stream
  → onFinish: check abort → write new node file → update tree.json → prune old files
  → abort/error: nothing written, nothing deleted
```

The prune targets are computed at request start (same as now) but stored in a closure and only executed inside `onFinish`.

**Abort guard:** `onFinish` may still fire after a client abort (the `flush()` callback behavior in Node.js runtime is not guaranteed to be skipped). To ensure safety, `onFinish` MUST check `request.signal.aborted` before executing persistence and pruning. If aborted, skip both — no file writes, no file deletes.

### 4. Error toast banner at page top

Fixed-position toast at the top of the workspace area. Orange/warning background, `⚠` icon + error message text + `×` close button. Does not occupy layout space (overlays content). Auto-dismisses when user starts a new generation, or manually via `×`. Reusable `Toast` component at app level for future use.

### 5. Mock stream cancel behavior

The mock stream's `cancel()` callback currently sets `cancelled = true` which skips persistence. This already works correctly for the stop case — no changes needed to mock stream handling.

## Risks / Trade-offs

- **[Concurrent prune race]** → If two generate requests overlap (shouldn't happen — UI disables Generate during loading), deferred prune could conflict. Mitigation: UI already prevents this via `isLoading` guard.
- **[Brief over-limit window]** → With deferred pruning, there's a moment during streaming where 6 node files exist on disk (5 old + 1 being written). This is harmless — the limit is enforced by tree.json, not by file count.
- **[useCompletion error semantics]** → Vercel AI SDK's `error` from `useCompletion` captures fetch-level errors. Business errors (404, 400) from the route return JSON, not a stream, so they may surface differently. Need to handle both: `error` state for stream failures, and check response status in the `complete()` call for business errors. **Action:** spike the actual behavior of `useCompletion` when it receives a non-stream JSON error response before implementing error handling.
- **[Server-side onFinish on abort]** → `streamText`'s `onFinish` runs in the `flush()` callback of a `TransformStream`. Under Node.js runtime, `flush()` is not guaranteed to be skipped when the client aborts. The abort guard (`request.signal.aborted` check) in Decision #3 mitigates this.
- **[Frontend onFinish on stop]** → `useCompletion`'s `onFinish` fires after `stop()` with `isAborted=true`. The `pendingNodeRef` null-check in Decision #2 mitigates this, but execution ordering should be verified during implementation.

## 1. Backend: Deferred Pruning

- [x] 1.1 In `src/app/api/articles/[slug]/generate/route.ts`, move the prune file deletion (currently lines 224–236) into `persistGeneratedNode` so it runs inside `onFinish` — compute prune targets at request start, store in closure, execute after new node is written
- [x] 1.2 Add abort guard in `onFinish`: check `request.signal.aborted` before persistence and pruning — if aborted, skip both
- [x] 1.3 Apply the same deferred-prune + abort guard pattern to the mock stream path if it has prune logic (verified: mock path's `cancelled` flag already prevents `onComplete` from running on abort; prune now runs inside `persistGeneratedNode` which mock path calls — no changes needed)

## 2. Frontend: Stop & Rollback

- [x] 2.1 In `workspace.tsx`, destructure `stop` and `error` from `useCompletion`
- [x] 2.2 Save a pre-generate snapshot before `doGenerate` mutations (previous nodes array, previous activeNode, removed node content if any), store in a ref
- [x] 2.3 Add `handleStop` function: call `stop()`, restore state from snapshot (remove pendingNode, restore activeNode, restore removed node content), clear pendingNodeRef — must run synchronously before `onFinish` fires
- [x] 2.4 Verify `useCompletion` `onFinish` is guarded: existing `if (!pendingNodeRef.current) return` should suffice since 2.3 clears the ref; if ordering issues arise, add an explicit `abortedRef` flag
- [x] 2.5 After rollback (stop or error), focus the instruction input so user can immediately edit and retry
- [x] 2.6 Pass `onStop={handleStop}` to `InstructionInput`

## 3. Frontend: Error Handling

- [x] 3.0 Spike: verified — `callCompletionApi` throws on `!response.ok` (reads body as text), caught by `setError(err)`. Both stream failures and business errors (400/404) set the `error` state. `onFinish` only fires on success. Abort returns null without setting error.
- [x] 3.1 Add `generationError` state to workspace; set from `useCompletion` `error` via useEffect; cleared when new generation starts
- [x] 3.2 On error, trigger the same rollback as stop (reuse `restoreSnapshot` in the error useEffect)
- [x] 3.3 Create a `Toast` component (`src/components/ui/toast.tsx`) — fixed-position top banner with orange/warning background, ⚠ icon, message text, × close button; render at workspace level, driven by `generationError` state

## 4. UI: Stop Button

- [x] 4.1 In `InstructionInput`, accept `onStop` prop; when `loading=true`, render Square (stop) icon instead of Sparkles, wire onClick to `onStop`

## 5. Verification

- [ ] 5.1 Manual test: generate → click Stop → pending node disappears, previous node restored, instruction text preserved, no files written to disk
- [ ] 5.2 Manual test: generate with 5 versions (triggers prune) → Stop → all 5 versions still on disk
- [ ] 5.3 Manual test: simulate error (e.g. invalid API key) → error banner appears, state rolls back, Generate button re-enabled

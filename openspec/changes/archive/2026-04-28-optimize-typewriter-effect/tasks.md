## 1. Stream Buffer Hook

- [x] 1.1 Create `src/hooks/use-stream-buffer.ts` with `useStreamBuffer(source, isStreaming, opts?)` signature
- [x] 1.2 Implement rAF drain loop that appends `charsPerFrame` characters per frame from source to displayedText
- [x] 1.3 Implement flush-on-complete: when `isStreaming` transitions false, set displayedText to full source immediately
- [x] 1.4 Expose `isBuffering` boolean (true when displayedText is behind source and streaming is active)
- [x] 1.5 Handle rAF cleanup on unmount via useEffect return

## 2. Paragraph-Boundary Memoization

- [x] 2.1 Write `splitAtParagraphBoundary(text)` utility that splits at last `\n\n` not inside a fenced code block
- [x] 2.2 Create a `MemoizedMarkdown` component wrapped with `React.memo` that only re-renders when its content prop changes
- [x] 2.3 Update `OutputStream` to split `displayedText` into frozen + active tail, rendering frozen via MemoizedMarkdown and tail via word-level fade-in StreamingTail

## 3. Integration

- [x] 3.1 Wire `useStreamBuffer` into `Workspace` (or `OutputStream`), feeding `completion` and `isLoading` from `useCompletion`
- [x] 3.2 Pass `displayedText` through the paragraph split and into the dual-renderer OutputStream
- [x] 3.3 Preserve the blinking cursor indicator during streaming (show when `isLoading || isBuffering`)

## 4. Verification (Phase A)

- [ ] 4.1 Test with a long generation (~2000+ words) — confirm no progressive jank
- [ ] 4.2 Test stream completion — confirm buffer flushes and cursor disappears cleanly
- [ ] 4.3 Test with content containing fenced code blocks with blank lines — confirm no mis-split

## 5. Adaptive Streaming Rate

- [x] 5.1 Replace fixed `charsPerFrame` drain in `useStreamBuffer` with time-delta-based adaptive algorithm: `baseTimePerChar = Math.min(5, 250 / remainingChars)`
- [x] 5.2 Track `lastUpdateTime` and compute `charsToAdd` from elapsed time rather than fixed frame count
- [ ] 5.3 Verify: large chunks (~500 chars) catch up within ~250ms; small trickles (~5 chars) animate over ~250ms

## 6. Stream Control (stop + error)

- [ ] 6.1 Destructure `stop` and `error` from `useCompletion` in `workspace.tsx`
- [ ] 6.2 Replace Generate button with Stop button during `isLoading`, wired to `stop()`
- [ ] 6.3 Render inline error banner below OutputStream when `error` is truthy (show message, offer retry)
- [ ] 6.4 Verify: clicking Stop aborts the stream mid-generation, content up to that point is preserved

## 7. Node ActionBar — DEPRECATED

~~- [ ] 7.1 Create `src/components/workspace/node-action-bar.tsx` with Copy / Feedback+ / Feedback− / Branch / Optimize / Promote slots~~
~~- [ ] 7.2 Implement Copy action (clipboard write + `data-copied` visual feedback)~~
~~- [ ] 7.3 Add `hideWhenRunning` behavior: during generation, only Stop is visible; ActionBar hidden~~
~~- [ ] 7.4 Add `autohide` behavior: in multi-node view, only bestNode shows ActionBar by default; others on hover~~
~~- [ ] 7.5 Wire Feedback+/− to `POST /api/feedback` (depends on phase 4 API)~~
~~- [ ] 7.6 Wire Branch/Optimize/Promote to respective APIs (depends on phase 3 APIs)~~

> Deprecated: branching model was superseded by polish mode. Feedback/Branch/Optimize/Promote APIs were never designed.

## 8. Verification (Phase B) — DEPRECATED

~~- [ ] 8.1 Test adaptive rate with varying chunk sizes — confirm smooth pacing without visible lag or jumps~~
~~- [ ] 8.2 Test Stop mid-generation — confirm content preserved, UI resets cleanly, no orphan requests~~
~~- [ ] 8.3 Test error states (409 one-shot, network failure) — confirm error banner appears with actionable message~~
~~- [ ] 8.4 Test ActionBar Copy — confirm clipboard write and visual feedback~~

> Deprecated: verification tasks for deprecated Group 7.

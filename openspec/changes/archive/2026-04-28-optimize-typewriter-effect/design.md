## Context

The `OutputStream` component renders AI-streamed text via `ReactMarkdown`. The `useCompletion` hook from `@ai-sdk/react` accumulates chunks into a single `completion` string, which is passed to `ReactMarkdown` on every update. As content grows, each chunk triggers a full markdown re-parse and DOM diff of the entire document. Network chunks also arrive in variable-sized bursts, producing an uneven visual rhythm.

Current flow:
```
useCompletion → completion (full string) → ReactMarkdown (full re-parse) → DOM
```

## Goals / Non-Goals

**Goals:**
- Eliminate progressive jank by memoizing already-rendered paragraphs
- Produce smooth, constant-rate character display regardless of network chunk timing
- Keep the implementation self-contained in the rendering layer (no API changes)

**Non-Goals:**
- Changing the streaming protocol or server-side chunking behavior
- Supporting rich interactive elements (code execution, embeds) during streaming
- Optimizing post-stream static rendering (already fine once streaming stops)

## Decisions

### 1. Paragraph-boundary split for memoization

**Choice**: Split the accumulated text at the last `\n\n` boundary. Everything before it is "frozen" and rendered by a `React.memo`-wrapped ReactMarkdown instance. Only the tail (current paragraph in progress) is re-rendered on each update.

**Why over alternatives**:
- *Sentence-level split*: Sentences don't map to markdown structure — splitting mid-list or mid-code-block produces parse errors.
- *Token-level virtualization*: Over-engineered for this use case; adds complexity without proportional benefit.
- *Replace ReactMarkdown entirely*: Would lose existing prose styling and plugin support.

Paragraph boundaries (`\n\n`) are natural markdown block separators — splitting here guarantees each frozen segment is a complete, parseable markdown block.

### 2. requestAnimationFrame character buffer

**Choice**: A `useStreamBuffer` hook that maintains a buffer of not-yet-displayed characters. A rAF loop drains characters at a configurable rate (default ~40 chars/frame ≈ 2400 chars/sec at 60fps). The hook exposes `displayedText` (what to render) rather than the raw `completion`.

**Why over alternatives**:
- *CSS animation on each character*: Requires wrapping every character in a span — DOM explosion.
- *setInterval-based drain*: Not synced to frame rendering; can cause dropped frames or visual tearing.
- *Server-side throttling*: Adds latency to all consumers, not just the display layer.

rAF naturally syncs with the browser's paint cycle and self-adjusts for device performance.

### 3. Hook extraction pattern

**Choice**: Extract buffer logic into `src/hooks/use-stream-buffer.ts` with the signature:
```
useStreamBuffer(source: string, isStreaming: boolean, opts?: { charsPerFrame?: number })
→ { displayedText: string, isBuffering: boolean }
```

The hook owns the rAF lifecycle. `OutputStream` consumes `displayedText` and splits it for memoized rendering. Clean separation: buffering logic vs. rendering logic.

### 4. Flush-on-complete behavior

**Choice**: When `isStreaming` transitions from `true` to `false`, the buffer immediately flushes all remaining characters (no animation for the tail). This prevents an awkward "still typing" effect after the server is done.

## Risks / Trade-offs

- **Added display latency (~50-200ms)**: The buffer introduces a small delay between chunk arrival and display. Acceptable for writing content; would not be appropriate for chat-style instant display. → Mitigation: configurable `charsPerFrame` lets callers tune the tradeoff.

- **Paragraph split edge case — no `\n\n` yet**: Early in generation, the entire text may be a single paragraph. → Mitigation: if no `\n\n` found, treat the whole text as the active tail (falls back to current behavior). Memoization kicks in once the first paragraph break arrives.

- **Code blocks spanning paragraph boundaries**: A fenced code block contains `\n\n` internally. → Mitigation: split only on `\n\n` that are NOT inside fenced code blocks (track open/close ``` markers).

---

## Phase B Decisions (assistant-ui / AI SDK patterns)

### 5. Adaptive streaming rate (from assistant-ui `useSmooth`)

**Choice**: Replace fixed `charsPerFrame = 40` with time-based adaptive drain from assistant-ui's `TextStreamAnimator`:

```
baseTimePerChar = Math.min(5, 250 / remainingChars)
```

**Why**: The fixed rate has two failure modes:
- Large chunks (500+ chars arriving at once): 40 chars/frame takes ~13 frames to catch up, creating visible lag behind the actual stream
- Small chunks (1-5 chars): consumed in a single frame with no animation, losing the typewriter feel

The adaptive algorithm auto-adjusts: large backlogs drain fast (catch-up), small trickles drain slow (smooth reveal). This eliminates the double-buffering coordination problem between `useCompletion` state updates and the RAF loop.

**What changes**: `useStreamBuffer` switches from frame-count-based drain to time-delta-based drain. The `charsPerFrame` option is replaced by the adaptive formula. `isBuffering` semantics remain unchanged.

### 6. Stream cancellation via `stop()`

**Choice**: Destructure `stop` from existing `useCompletion` hook return; render a Stop button that replaces the Generate button during `isLoading`.

**Why**: Currently there is no way to abort a generation mid-stream. `useCompletion` already provides `stop()` — it's wired to an `AbortController` internally. Zero new plumbing needed.

### 7. Error state surfacing

**Choice**: Destructure `error` from `useCompletion`; render inline error banner below the OutputStream when `error` is truthy. Use `onError` callback for transient toast if needed later.

**Why**: Currently, API errors (409 one-shot violation, 400 validation, 500 server error) cause `isLoading` to toggle off silently with no user feedback. The `error` object is already available but not consumed.

### 8. Node ActionBar pattern (from assistant-ui `ActionBar` primitive)

**Choice**: Create a `NodeActionBar` component that renders as a hover-revealed toolbar below each node card. Actions: Copy, Feedback+, Feedback−, Branch, Optimize, Promote.

**Why**: assistant-ui's ActionBar demonstrates an effective pattern — actions co-located with content, contextually shown/hidden based on state. CyberInk's per-node operations (copy, feedback, branch, optimize, promote) are currently scattered or unbuilt. The ActionBar pattern makes them discoverable and contained.

Key behaviors borrowed from assistant-ui:
- `hideWhenRunning`: During generation, only show Stop — hide Branch/Optimize/Promote to prevent misuse
- `autohide`: On the node list view, only the bestNode shows ActionBar by default; other nodes reveal on hover
- `data-copied` / `data-submitted` attributes for visual feedback states (checkmark after copy, filled thumb after feedback)

**Scope note**: This decision captures the UI pattern. The actual feedback/branch/optimize/promote API integration depends on their respective phases (phase 3, 4). Phase B implements the ActionBar shell with Copy working immediately; other actions are wired as their APIs become available.

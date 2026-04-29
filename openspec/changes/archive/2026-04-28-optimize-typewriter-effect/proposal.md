## Why

The OutputStream component re-parses the entire accumulated markdown on every streaming chunk via ReactMarkdown, causing progressive jank as content grows. Network chunk timing also creates a bursty, uneven text appearance instead of a smooth writing feel. Additionally, the current implementation lacks stream cancellation, error feedback, and the fixed-rate typewriter produces uneven pacing when chunk sizes vary.

## What Changes

### Phase A — Streaming render optimization (DONE)
- Split streamed content at paragraph boundaries; memoize already-rendered paragraphs so only the active tail is re-parsed on each chunk
- Add a requestAnimationFrame-based character buffer that drains at a constant rate, smoothing bursty network chunks into even typewriter flow
- Extract streaming display logic into a dedicated hook (`useStreamBuffer`) and update OutputStream to use the new rendering strategy

### Phase B — AI SDK + assistant-ui pattern adoption
- **Adaptive streaming rate**: Replace fixed 40 chars/frame drain with assistant-ui's `TextStreamAnimator` algorithm (`Math.min(5, 250 / remainingChars)`) — large chunks catch up fast, small chunks animate smoothly
- **Stream cancellation**: Wire `stop()` from `useCompletion` to a Stop button shown during generation
- **Error handling**: Surface `error` state from `useCompletion` with inline error display
- **Node ActionBar**: Add a hover-revealed action bar below each node card (Copy / Feedback+ / Feedback− / Branch / Optimize / Promote), inspired by assistant-ui's `ActionBar` primitive pattern
- **State-aware UI**: Hide destructive actions during generation (`hideWhenRunning`), show only Stop; only expand ActionBar on bestNode by default (`autohide`)

## Capabilities

### New Capabilities
- `stream-buffer`: Client-side character buffering with rAF drain for smooth typewriter output
- `memoized-markdown`: Paragraph-boundary memoization to avoid full re-parse on each streaming chunk
- `adaptive-stream-rate`: Time-based adaptive character drain that adjusts speed to buffer depth
- `stream-control`: Stop/cancel mid-generation + error display from AI SDK hooks
- `node-action-bar`: Inline action bar per node card for copy, feedback, branch, optimize, promote

### Modified Capabilities

_(none)_

## Impact

- **Code**: `src/components/workspace/output-stream.tsx` (major rewrite), `src/hooks/use-stream-buffer.ts` (adaptive rate), `src/components/workspace/workspace.tsx` (stop/error), new `src/components/workspace/node-action-bar.tsx`
- **Dependencies**: No new dependencies — uses React.memo, useRef, requestAnimationFrame, existing AI SDK hooks
- **APIs**: No API changes; server streaming is unchanged
- **Risk**: Low — Phase A is purely rendering; Phase B adds UI controls around existing hook capabilities

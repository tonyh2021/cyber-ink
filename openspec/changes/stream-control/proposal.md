## Why

Users cannot stop a generation mid-stream or recover from errors. Once generation starts, the only option is to wait. Worse, the backend deletes old version files before streaming begins, so if the stream fails or the connection drops, the old version is already gone and the new version was never written — data loss.

## What Changes

- **Stop button**: Generate button becomes a Stop button during streaming. Clicking it aborts the stream and rolls back all frontend state to pre-generate (pendingNode removed, activeNode restored, instruction preserved in input)
- **Error handling**: Stream errors trigger the same rollback, plus a fixed-position toast banner at the top of the workspace
- **Deferred version pruning**: Backend moves old version file deletion from before-stream to inside `onFinish`, so aborted/failed generations never delete existing versions
- **No partial persistence**: Stop and error both result in zero filesystem changes — as if generation never happened

## Capabilities

### New Capabilities
- `stream-control`: Stop generation mid-stream with clean rollback, error display with recovery, and safe deferred version pruning

### Modified Capabilities

## Impact

- **Backend**: `src/app/api/articles/[slug]/generate/route.ts` — move prune logic into `onFinish` callback
- **Frontend state**: `src/components/workspace/workspace.tsx` — destructure `stop`/`error` from `useCompletion`, save pre-generate snapshot for rollback, handle stop/error
- **UI**: `src/components/workspace/instruction-input.tsx` — swap Generate icon for Stop icon during loading
- **UI**: Error toast rendered as fixed-position banner at workspace top
- **No new dependencies**

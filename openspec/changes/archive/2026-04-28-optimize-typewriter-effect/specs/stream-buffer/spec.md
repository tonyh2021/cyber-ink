## ADDED Requirements

### Requirement: Character buffer smooths network chunks
The `useStreamBuffer` hook SHALL accept a source string and streaming flag, and SHALL expose a `displayedText` string that grows at a constant character rate regardless of how the source string grows.

#### Scenario: Steady drain during streaming
- **WHEN** the source string grows by 200 characters in a single chunk while streaming is active
- **THEN** `displayedText` SHALL grow at approximately `charsPerFrame` characters per animation frame until it catches up to the source

#### Scenario: Multiple rapid chunks
- **WHEN** three chunks arrive within one animation frame
- **THEN** the buffer SHALL accumulate all new characters and continue draining at the configured rate without skipping or doubling

### Requirement: Configurable drain rate
The hook SHALL accept an optional `charsPerFrame` parameter (default: 40) that controls how many characters are appended to `displayedText` per requestAnimationFrame tick.

#### Scenario: Custom drain rate
- **WHEN** `charsPerFrame` is set to 20
- **THEN** the displayed text SHALL grow by approximately 20 characters per frame

### Requirement: Flush on stream completion
When the `isStreaming` flag transitions from `true` to `false`, the hook SHALL immediately set `displayedText` to the full source string, bypassing the character-by-character drain.

#### Scenario: Stream ends with buffered characters
- **WHEN** the buffer contains 500 undisplayed characters and `isStreaming` becomes `false`
- **THEN** all 500 characters SHALL appear immediately in `displayedText`

#### Scenario: Stream ends with empty buffer
- **WHEN** the buffer has fully caught up and `isStreaming` becomes `false`
- **THEN** `displayedText` SHALL equal the source string and no additional animation frames SHALL be scheduled

### Requirement: Buffering state indicator
The hook SHALL expose an `isBuffering` boolean that is `true` whenever `displayedText` is shorter than the source string and streaming is active.

#### Scenario: Buffer draining
- **WHEN** new characters have arrived but not yet been displayed
- **THEN** `isBuffering` SHALL be `true`

#### Scenario: Buffer caught up
- **WHEN** `displayedText` equals the source string
- **THEN** `isBuffering` SHALL be `false`

### Requirement: Clean rAF lifecycle
The hook SHALL cancel any pending requestAnimationFrame callback when the component unmounts.

#### Scenario: Component unmounts during streaming
- **WHEN** the component unmounts while the buffer is still draining
- **THEN** the rAF loop SHALL be cancelled and no further state updates SHALL occur

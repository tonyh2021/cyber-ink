## ADDED Requirements

### Requirement: Stop generation mid-stream
The system SHALL allow users to stop an in-progress generation. Stopping MUST abort the stream and roll back all frontend state to pre-generate: pendingNode removed, activeNode restored to previous version, instruction input content preserved.

#### Scenario: User clicks Stop during generation
- **WHEN** generation is streaming and user clicks the Stop button
- **THEN** the stream is aborted, the pending version tab disappears, the previously active node is restored, and the instruction text remains in the input

#### Scenario: Stop with version pruning pending
- **WHEN** generation was triggered with 5 existing versions (oldest would be pruned) and user clicks Stop
- **THEN** all 5 original versions remain intact on disk and in the UI — no files are deleted

#### Scenario: Generate button becomes Stop button
- **WHEN** generation is in progress (isLoading is true)
- **THEN** the Generate button displays a stop icon and triggers abort on click

#### Scenario: Generate button restored after stop
- **WHEN** user has stopped a generation
- **THEN** the button reverts to the Generate icon and is enabled for a new generation

### Requirement: Error display and recovery
The system SHALL display an inline error banner when generation fails and roll back frontend state identically to a stop.

#### Scenario: Stream error during generation
- **WHEN** a network error or provider error occurs during streaming
- **THEN** a toast banner appears at the top of the workspace (orange background, ⚠ icon, error message, × close button), frontend state rolls back to pre-generate, and the instruction input content is preserved

#### Scenario: Error toast dismissal on new generation
- **WHEN** an error toast is visible and user starts a new generation
- **THEN** the error toast is dismissed

#### Scenario: Error toast manual dismissal
- **WHEN** an error toast is visible and user clicks the × button
- **THEN** the error toast is dismissed

#### Scenario: Business error from generate API
- **WHEN** the generate API returns a non-stream error response (e.g. 404, 400)
- **THEN** an error toast appears with the error message, no pending node is created, and instruction input is preserved

### Requirement: Deferred version pruning
The system SHALL defer deletion of old version files until after the new version is successfully written to disk.

#### Scenario: Successful generation with pruning
- **WHEN** generation completes successfully and the version count exceeds the limit
- **THEN** the new version file is written first, then old version files are deleted

#### Scenario: Aborted generation preserves old versions
- **WHEN** generation is aborted (stop or error) and pruning was pending
- **THEN** no version files are deleted and no new version file is written

#### Scenario: onFinish not called on abort
- **WHEN** the stream is aborted by the client
- **THEN** the backend `onFinish` callback does not execute, so neither persistence nor pruning occurs

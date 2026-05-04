## ADDED Requirements

### Requirement: Text selection popover on polish canvas
The system SHALL display a popover with a "Quote" action when the user selects text within the OutputStream content area during an active polish session (non-diff mode).

#### Scenario: User selects text in OutputStream
- **WHEN** the user selects non-empty text within the OutputStream container via mouse drag
- **THEN** a popover appears near the selection with a "Quote" button

#### Scenario: Selection is empty or collapsed
- **WHEN** the user clicks without dragging (collapsed selection) or clears selection
- **THEN** no popover is shown, or an existing popover is dismissed

#### Scenario: User clicks outside popover
- **WHEN** the popover is visible and the user clicks outside of it (not on the Quote button)
- **THEN** the popover is dismissed

#### Scenario: Polish round is streaming
- **WHEN** a polish round is in progress (`polishLoading` is true)
- **THEN** no selection popover is shown, even if the user selects text

#### Scenario: Diff mode is active
- **WHEN** the user is viewing PolishDiff (diff mode enabled)
- **THEN** no selection popover is available (feature only applies to OutputStream view)

### Requirement: Quote action captures selected text
The system SHALL capture the selected text as a quote and inject it into the polish dialog input area when the user clicks the "Quote" button in the popover.

#### Scenario: User clicks Quote button
- **WHEN** the user clicks the "Quote" button in the selection popover
- **THEN** the selected text is stored as the active quote, the popover is dismissed, the textarea input is focused, and a quote preview bar appears above the textarea

#### Scenario: Quote preview bar display
- **WHEN** a quote is active (polishQuote is set)
- **THEN** a preview bar above the textarea shows the quoted text (truncated if long) with a dismiss (×) button

#### Scenario: User dismisses quote via × button
- **WHEN** the user clicks the × button on the quote preview bar
- **THEN** the quote is cleared, the preview bar disappears, and the textarea remains unchanged

#### Scenario: User sends instruction with active quote
- **WHEN** the user submits a polish instruction while a quote is active
- **THEN** the quote is included with the instruction in the polish round request, and the quote is cleared after sending

### Requirement: Quote display in conversation thread
The system SHALL render quoted text as a visually distinct block within user messages in the polish dialog conversation thread.

#### Scenario: User message has a quote
- **WHEN** a user message in the conversation history has an associated quote
- **THEN** the quote is rendered as a left-border-accented block (border-l-2, brand-accent color, secondary text) above the instruction text within the user message bubble, truncated to 3 lines

#### Scenario: User message has a long quote
- **WHEN** a user message quote exceeds 3 lines
- **THEN** the quote is visually truncated with line-clamp-3, and hovering over it shows a popover with the full quote text

#### Scenario: User message has no quote
- **WHEN** a user message in the conversation history has no quote
- **THEN** the message renders as plain text only (no quote block), matching current behavior

### Requirement: Quote field in polish history
The system SHALL store the quote as a structured field in `PolishHistoryEntry` and persist it to `history.json`.

#### Scenario: Polish round with quote
- **WHEN** a polish round is submitted with a quote
- **THEN** the user entry in `history.json` includes a `quote` field with the selected text

#### Scenario: Polish round without quote
- **WHEN** a polish round is submitted without a quote
- **THEN** the user entry in `history.json` has no `quote` field (backward compatible)

#### Scenario: Session restore with quotes in history
- **WHEN** a polish session is restored from disk (page reload)
- **THEN** all quotes in history entries are preserved and rendered correctly in the conversation thread

### Requirement: Quote context in AI instruction
The system SHALL concatenate the quote into the instruction text sent to the AI model so the AI understands which passage the user is referencing.

#### Scenario: Instruction with quote sent to AI
- **WHEN** the polish round API receives `{ instruction, quote }`
- **THEN** the instruction passed to `buildPolishPrompt` is assembled as a markdown blockquote followed by the instruction: `> {quote}\n\n{instruction}`

#### Scenario: Instruction without quote sent to AI
- **WHEN** the polish round API receives `{ instruction }` with no quote
- **THEN** the instruction is passed to `buildPolishPrompt` unchanged

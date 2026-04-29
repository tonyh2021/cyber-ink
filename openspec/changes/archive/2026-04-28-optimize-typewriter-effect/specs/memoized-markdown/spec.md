## ADDED Requirements

### Requirement: Paragraph-boundary content split
The OutputStream component SHALL split the displayed text at the last paragraph boundary (`\n\n` not inside a fenced code block). Content before the boundary is the "frozen" portion; content after is the "active tail."

#### Scenario: Text with multiple paragraphs
- **WHEN** the displayed text contains three paragraphs separated by `\n\n`
- **THEN** the first two paragraphs SHALL be the frozen portion and the third SHALL be the active tail

#### Scenario: No paragraph boundary yet
- **WHEN** the displayed text contains no `\n\n`
- **THEN** the entire text SHALL be treated as the active tail and no frozen portion SHALL exist

#### Scenario: Code block containing blank lines
- **WHEN** a fenced code block contains `\n\n` within its delimiters
- **THEN** that `\n\n` SHALL NOT be treated as a paragraph boundary for splitting

### Requirement: Frozen portion memoization
The frozen portion SHALL be rendered by a memoized ReactMarkdown instance that does NOT re-render when only the active tail changes.

#### Scenario: New chunk extends active tail
- **WHEN** a new character arrives that extends the active tail without creating a new paragraph boundary
- **THEN** the frozen ReactMarkdown instance SHALL NOT re-render

#### Scenario: New paragraph boundary forms
- **WHEN** a `\n\n` arrives that creates a new paragraph boundary
- **THEN** the frozen portion SHALL grow to include the newly completed paragraph and the memoized component SHALL re-render once with the updated frozen content

### Requirement: Active tail live rendering
The active tail SHALL be rendered by a non-memoized ReactMarkdown instance that re-renders on every update to show streaming progress.

#### Scenario: Characters arriving within current paragraph
- **WHEN** characters arrive that belong to the current in-progress paragraph
- **THEN** the active tail renderer SHALL update to show them immediately

### Requirement: Visual continuity
The frozen portion and active tail SHALL render as a single continuous document with no visible seam, gap, or style difference between them.

#### Scenario: Paragraph boundary transition
- **WHEN** text transitions from active tail to frozen portion
- **THEN** there SHALL be no layout shift, flash, or duplicate content visible to the user

## Why

CyberInk's generation quality is static — the seed style never evolves. Users have no way to signal what writing they like, and no mechanism exists to improve style over time. The feedback-driven style regeneration loop is CyberInk's core differentiator: writing quality that self-improves through use.

## What Changes

- Implement versioned style management: immutable style versions (v1.md, v2.md, ...), active pointer (active.md), rollback to any historical version
- Support multiple independent style directories (e.g., `tech-vibe/`, `lifestyle/`)
- Add two-level feedback collection: full-node feedback (boolean: mark as good) and paragraph-level feedback (select text → save specific paragraphs)
- Feedback stored under style directory, not article — persists across article deletions
- Implement style regeneration: pre-stored reference articles + accumulated feedback → analysis model multi-round extraction → new immutable style version
- Add style management page with feedback list, deletion, and regeneration trigger

## Capabilities

### New Capabilities

- `style-management`: Versioned style system with immutable versions, active pointer, rollback via set-active API, and multiple independent style directories
- `feedback-collection`: Two-granularity feedback — full-node boolean feedback (`[slug]-[node].md`) and paragraph-level feedback (`[slug]-[node]-para.md`) stored under style's `/feedback/` directory
- `style-regeneration`: Multi-round analysis model processing of pre-stored reference articles + user feedback to produce new immutable style version with updated active pointer

### Modified Capabilities

_(none)_

## Impact

- **Code**: New API routes for styles and feedback; style management page; feedback UI in article workspace (mark as good, paragraph selection)
- **APIs**: `GET/POST /api/styles/*` (list, active, regenerate, set-active), `POST/GET/DELETE /api/feedback`
- **Dependencies**: No new dependencies
- **Data**: Style directories gain `/feedback/` and `/references/` subdirectories; new style version files created on regeneration
- **Risk**: Medium — style regeneration involves multi-round LLM processing with accumulated feedback; paragraph-level text selection UX requires careful implementation

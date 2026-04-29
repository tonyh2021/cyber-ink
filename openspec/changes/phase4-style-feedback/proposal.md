# Phase 4 — Style System & Feedback Loop

## Summary

Implement the style management system (versioned styles, active pointer, rollback) and the feedback loop (user marks good content → feedback stored → style regeneration). This is CyberInk's self-improving core — the mechanism that makes writing quality evolve over time.

## Depends on

- Phase 3 (evaluation, working writing loop with nodes to give feedback on)
- Phase 1 (seed style used since Phase 1, now gets full management)

## Scope

### Style Directory Structure

```
/data/styles/[style-name]/
  v1.md, v2.md, ...               # Style versions (immutable once created)
  active.md                        # Points to current active version + rollback
  /feedback/
    [slug]-[node].md               # Full-node feedback (boolean: one file per node)
    [slug]-[node]-para.md          # Paragraph-level feedback (single file, multiple paragraphs)
```

/data/references/
  ref-001.md, ...                  # Global pre-stored reference articles for style regeneration

**active.md structure:**

```yaml
---
current: "v2"
updatedAt: "2025-01-01"
---
```

User can switch `active.md` to any historical version via `set-active` API for rollback.

**Multiple style directories supported** (e.g. `tech-vibe/`, `lifestyle/`), each independently manages versions, feedback, and references.

### Feedback Collection

**Two granularity levels:**

| Type | Trigger | Storage filename | Semantics |
|------|---------|-----------------|-----------|
| Full node | Click Mark as Good on node page | `[slug]-[node].md` | Boolean: create file = good, delete = remove |
| Paragraph | Select text → floating Save this paragraph | `[slug]-[node]-para.md` | Single file, append paragraphs |

**Storage location:** `/data/styles/[style-name]/feedback/`

Feedback belongs to the style system, not cleaned up when articles are deleted.

**Full-node feedback file:**

```yaml
---
slug: "article-slug"
node: "v2-b"
type: "full"
createdAt: "2025-01-01"
---

## Content

[Satisfied content in full]
```

**Paragraph-level feedback file:**

```yaml
---
slug: "article-slug"
node: "v2-b"
type: "paragraph"
createdAt: "2025-01-01"
---

## Paragraphs

> First satisfied paragraph...

> Second satisfied paragraph...
```

**UI entry points (two):**

- Article node page — Mark as Good / Save paragraph
- Style page — View feedback list (deletable) + Regenerate Style with Feedback button

### UX Contract

- Feedback interactions must be user-initiated only; no automatic prompting or implicit capture.
- Full-node feedback uses boolean semantics in UX:
  - marked = feedback file exists
  - unmarked = feedback file removed
- Paragraph feedback must be explicit text selection first, then a scoped save action (floating action near selection).
- Style page must expose feedback management as a first-class surface:
  - list existing feedback
  - support deletion (full item or paragraph index)
  - provide a clear "Regenerate Style with Feedback" trigger
- Regeneration outcome must be legible to users as a new immutable style version (`vN`) with updated active pointer.

**Delete mechanism:**

- Full feedback: `DELETE /api/feedback/[id]`, id = `slug-node`
- Paragraph feedback: `DELETE /api/feedback/[id]`, id = `slug-node-para`, body includes `index` specifying which paragraph to remove

### Style Regeneration

```
/data/references/ pre-stored reference articles (5–15, global)
       +
/feedback/ satisfied content (positive examples)
       ↓
  analysis model multi-round extraction
       ↓
  Write new vN.md → update active.md
```

- Uses the `analysis` model role
- Feedback accumulates without limit
- Regeneration can process in multiple rounds, not constrained by context window
- Each regeneration creates a new immutable `vN.md` — never overwrites existing versions

### APIs

```
GET    /api/styles                          # List all style directories
GET    /api/styles/active                   # Get current active style content
POST   /api/styles/regenerate               # Regenerate style vN (references + feedback → analysis model)
POST   /api/styles/set-active               # Switch active version (also for rollback)
POST   /api/feedback                        # Submit satisfied content (full or paragraph)
GET    /api/feedback                        # List all feedback for current style
DELETE /api/feedback/[id]                   # Delete feedback entry
```

## Non-goals

- No automatic feedback prompting — user initiates all feedback
- No cross-style feedback sharing — each style directory is independent

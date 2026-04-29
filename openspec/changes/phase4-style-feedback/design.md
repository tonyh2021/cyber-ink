## Context

Since Phase 1, generation uses a single seed style file (`/data/styles/default/active.md`). The style never changes — there is no mechanism for users to signal what writing they like, and no way to improve style over time. This is CyberInk's core differentiator gap: the self-improving feedback loop.

Current state:
- `/data/styles/default/active.md` — single seed style, read-only
- No feedback storage
- No style versioning
- No reference articles for style regeneration
- Evaluation exists (Phase 3) but doesn't feed back into style improvement

**Depends on:**
- Phase 3 (evaluation, working writing loop with nodes to give feedback on)
- Phase 1 (seed style used since Phase 1, now gets full management)

## Goals / Non-Goals

**Goals:**
- Versioned, immutable style system with rollback capability
- Multiple independent style directories
- Two-granularity feedback collection (full-node + paragraph-level)
- Style regeneration from reference articles + accumulated feedback
- Style management page for feedback review and regeneration trigger

**Non-Goals:**
- No automatic feedback prompting — user initiates all feedback
- No cross-style feedback sharing — each style directory is independent
- No real-time style adaptation during generation — regeneration is an explicit action

## Decisions

### 1. Style directory structure with immutable versions

**Choice:**

```
/data/styles/[style-name]/
  v1.md, v2.md, ...               # Style versions (immutable once created)
  active.md                        # Points to current active version + rollback
  /feedback/
    [slug]-[node].md               # Full-node feedback (boolean: one file per node)
    [slug]-[node]-para.md          # Paragraph-level feedback (single file, multiple paragraphs)
```

**active.md structure:**

```yaml
---
current: "v2"
updatedAt: "2025-01-01"
---
```

**Multiple style directories supported** (e.g., `tech-vibe/`, `lifestyle/`), each independently manages versions, feedback, and references.

User can switch `active.md` to any historical version via `set-active` API for rollback.

**Why immutable versions:** Style evolution should be traceable. If a regeneration produces a worse style, the user can roll back to any previous version. Immutability also makes the system Git-friendly — each version is a distinct file.

**Why active.md as pointer:** Separating the pointer from the content means switching versions is a metadata update, not a file copy. The prompt builder reads `active.md` → resolves to `vN.md` → uses that content.

### 2. Two-granularity feedback model

**Choice:** Two feedback types stored under the style's `/feedback/` directory:

| Type | Trigger | Storage filename | Semantics |
|------|---------|-----------------|-----------|
| Full node | Click "Mark as Good" on node page | `[slug]-[node].md` | Boolean: create file = good, delete = remove |
| Paragraph | Select text → floating "Save this paragraph" | `[slug]-[node]-para.md` | Single file, append paragraphs |

**Full-node feedback file format:**

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

**Paragraph-level feedback file format:**

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

**Why two granularity levels:** Full-node feedback is fast (one click) but coarse — it includes everything in the node. Paragraph-level feedback lets users pinpoint exactly which passages exemplify good writing. Both contribute to style regeneration as positive examples.

**Why feedback belongs to style, not article:** Feedback represents "writing I like" — a style preference, not article metadata. When articles are deleted, the feedback that shaped the style should persist.

### 3. Feedback UX entry points

**Choice:** Two surfaces for feedback interaction:

- **Article node page** — "Mark as Good" button + text selection → "Save this paragraph" floating action
- **Style page** — View feedback list (deletable) + "Regenerate Style with Feedback" button

**UX rules:**
- Feedback interactions must be user-initiated only; no automatic prompting or implicit capture
- Full-node feedback uses boolean semantics: marked = file exists, unmarked = file removed
- Paragraph feedback requires explicit text selection first, then a scoped save action (floating action near selection)
- Style page must expose feedback management as a first-class surface: list, delete, regenerate trigger
- Regeneration outcome appears as a new immutable style version (`vN`) with updated active pointer

**Delete mechanism:**
- Full feedback: `DELETE /api/feedback/[id]`, id = `slug-node`
- Paragraph feedback: `DELETE /api/feedback/[id]`, id = `slug-node-para`, body includes `index` specifying which paragraph to remove

### 4. Style regeneration pipeline

**Choice:**

```
/data/references/ pre-stored reference articles (5–15, global)
       +
/feedback/ satisfied content (positive examples)
       ↓
  analysis model multi-round extraction
       ↓
  Write new vN.md → update active.md
```

- Uses the `analysis` model role (GPT-4o-mini)
- Feedback accumulates without limit
- Regeneration can process in multiple rounds, not constrained by context window
- Each regeneration creates a new immutable `vN.md` — never overwrites existing versions

**Why reference articles + feedback:** Reference articles provide a stable baseline of good writing. Feedback adds the user's personal preferences on top. Together they give the analysis model both general quality signals and specific user taste.

**Why multi-round:** The combined reference + feedback corpus may exceed a single context window. Multi-round processing (extract patterns from batch 1 → refine with batch 2 → ...) handles arbitrary feedback volume.

### 5. API design

```
GET    /api/styles                          # List all style directories
  → 200: StyleSummary[]

GET    /api/styles/active                   # Get current active style content
  → 200: { styleName, version, content }

POST   /api/styles/regenerate               # Regenerate style vN
  body: { styleName: string }
  → 200: { version: string, path: string }

POST   /api/styles/set-active               # Switch active version (rollback)
  body: { styleName: string, version: string }
  → 200: { current: string }

POST   /api/feedback                        # Submit feedback
  body: { slug, nodeId, type: "full" | "paragraph", content?, paragraphs? }
  → 201: { id: string }

GET    /api/feedback                        # List all feedback for current style
  → 200: FeedbackEntry[]

DELETE /api/feedback/[id]                   # Delete feedback entry
  body?: { index: number }  # only for paragraph deletion
  → 204
```

## Risks / Trade-offs

- **Style regeneration latency**: Multi-round LLM processing with accumulated feedback can take minutes. → Mitigation: run regeneration as an async operation with progress indicator; the user explicitly triggers it and waits.

- **Paragraph selection UX complexity**: Reliable text selection detection in rendered Markdown is non-trivial (especially across code blocks, lists, blockquotes). → Mitigation: limit paragraph selection to prose paragraphs in the initial implementation; extend to other block types if needed.

- **Feedback volume growth**: Feedback accumulates without limit. Over time, regeneration input grows. → Mitigation: multi-round processing handles arbitrary volume. If performance degrades, add a "most recent N" filter or feedback pruning UI.

- **Multiple style directories complexity**: Supporting multiple independent styles adds surface area. → Mitigation: start with a single `default` style directory; the multi-directory structure is ready but UI for creating/switching styles can be minimal initially.

## UX Contract

- Feedback interactions must be user-initiated only; no automatic prompting or implicit capture.
- Full-node feedback uses boolean semantics in UX: marked = feedback file exists, unmarked = feedback file removed.
- Paragraph feedback must be explicit text selection first, then a scoped save action (floating action near selection).
- Style page must expose feedback management as a first-class surface: list existing feedback, support deletion (full item or paragraph index), provide a clear "Regenerate Style with Feedback" trigger.
- Regeneration outcome must be legible to users as a new immutable style version (`vN`) with updated active pointer.

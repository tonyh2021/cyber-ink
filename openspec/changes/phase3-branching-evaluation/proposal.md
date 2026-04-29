# Phase 3 — Branching, Evaluation & Promotion

## Summary

Implement the branching system (fork v1 → v2-x variants), optimize (in-place rewrite), auto-evaluation after every generation, and the promotion flow. After this phase, the full writing exploration loop is functional: generate → branch → evaluate → compare → promote.

## Depends on

- Phase 1 (generation pipeline, prompt builder)
- Phase 2 (article CRUD, full workspace page, material input)

## Scope

### Branching System (2-level cap)

```
v1              # Root (depth 1)
├── v2-a        # Branch (depth 2)
├── v2-b        # Branch (depth 2, max 4 siblings)
└── v2-c        # Branch (depth 2)
```

| Operation | Applicable level | Description |
|-----------|-----------------|-------------|
| branch | v1 only | Fork v1 → v2-x. User provides instruction for the new direction |
| optimize | v1 + v2-x | In-place rewrite (irreversible, overwrites original content) |

**Rules:**
- Depth-2 nodes cannot branch further, only optimize
- Max 4 sibling branches (enforced)
- Optimize is in-place rewrite with no history — use branch for exploring different directions
- Branch uses the Prompt Builder with raw material + user's branch instruction
- After branch/optimize, auto-trigger evaluation

### Evaluation System

Auto-triggered after every generate / branch / optimize. Written to `/evaluation/[node].json`:

```json
{
  "clarity": 0.87,
  "style_match": 0.91,
  "information_density": 0.78,
  "reader_engagement": 0.84,
  "hallucination_risk": 0.10,
  "overall_score": 0.85
}
```

- Uses the `analysis` model role
- Scores are 0–1 floats
- After evaluation, update `bestNode` in tree.json (highest overall_score)
- Scores are **advisory only** — promote authority always belongs to the user

### Selection & Promotion

- `bestNode` in tree.json is auto-updated to the node with highest overall_score
- User can promote **any** node regardless of score
- Promote flow: select node → copy content → `final.md` → update `meta.md` status to `"final"`

### UX Contract

- The version tree must visually distinguish `bestNode` from other nodes (highlight only, never auto-promote).
- Evaluation display must clearly communicate "advisory only"; users can still promote any node.
- `branch` and `optimize` must remain explicit user actions with clear labels:
  - `branch`: create a new `v2-x` variant from `v1`
  - `optimize`: in-place rewrite on the selected node (irreversible)
- Promote interaction must require explicit user intent on a selected node (no score-based auto-promotion path).
- After generate/branch/optimize, evaluation refresh should be visible in the node context the user is viewing.

### APIs

```
POST /api/articles/[slug]/branch          # Fork v1 → v2-x
POST /api/articles/[slug]/optimize        # In-place optimize node (irreversible)
POST /api/articles/[slug]/promote         # Promote → final.md
POST /api/evaluate/node                   # Evaluate single node
GET  /api/evaluate/[slug]/[node]          # Read node evaluation scores
```

### Retroactive: Auto-evaluate on generate

Phase 1's generate endpoint and Phase 2's full workspace should now auto-trigger evaluation after v1 is written. This is wired up in this phase.

## Non-goals

- No diff view yet (Phase 5)
- No feedback collection (Phase 4)

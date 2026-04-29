## Context

After Phase 2, the writing pipeline supports: create article → paste material → generate v1. But there is no way to explore alternative directions from v1, evaluate quality, or finalize an article. The user is stuck with a single draft.

Current state:
- Articles have `tree.json` (initialized but only tracks v1 after generate)
- `/nodes/` contains only `v1.md`
- `/evaluation/` is empty
- No `final.md` exists yet
- Workspace page shows single node output

This phase completes the core writing exploration loop: generate → branch → evaluate → compare → promote.

**Depends on:**
- Phase 1 (generation pipeline, prompt builder)
- Phase 2 (article CRUD, full workspace page, material input)

## Goals / Non-Goals

**Goals:**
- Users can fork v1 into multiple v2-x variants to explore different writing directions
- Users can optimize (in-place rewrite) any node
- Every generation/branch/optimize auto-triggers quality evaluation
- Users can compare nodes by score and promote any node to final
- Evaluation scores are advisory — user always has final authority

**Non-Goals:**
- No diff view (Phase 5)
- No feedback collection (Phase 4)
- No branching beyond depth 2 (by design, not a future goal)

## Decisions

### 1. Two-level branching model with depth cap

**Choice:** Strict 2-level tree with enforced constraints:

```
v1              # Root (depth 1)
├── v2-a        # Branch (depth 2)
├── v2-b        # Branch (depth 2, max 4 siblings)
└── v2-c        # Branch (depth 2)
```

| Operation | Applicable level | Description |
|-----------|-----------------|-------------|
| `branch` | v1 only | Fork v1 → v2-x. User provides instruction for the new direction |
| `optimize` | v1 + v2-x | In-place rewrite (irreversible, overwrites original content) |

**Rules:**
- Depth-2 nodes cannot branch further, only optimize
- Max 4 sibling branches (enforced server-side)
- Optimize is in-place rewrite with no history — use branch for exploring different directions
- Branch uses the Prompt Builder with raw material + user's branch instruction
- After branch/optimize, auto-trigger evaluation

**Why over deeper trees:** Deeper branching creates combinatorial complexity that overwhelms the comparison UX. Two levels (original + variants) maps to the natural writing workflow: write a draft, try several directions, pick the best. The 4-sibling cap prevents sprawl while allowing meaningful exploration.

**Why optimize is irreversible:** Keeping history would duplicate the branching concept. Optimize means "improve this in place" — if the user wants to preserve the original, they should branch first.

### 2. Evaluation schema and auto-trigger

**Choice:** Auto-evaluate after every generate/branch/optimize. Scores written to `/evaluation/[node].json`:

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

- Uses the `analysis` model role (GPT-4o-mini via config.json)
- All scores are 0–1 floats
- After evaluation completes, update `bestNode` in tree.json to the node with highest `overall_score`
- Scores are **advisory only** — promote authority always belongs to the user

**Why auto-trigger over manual:** Evaluation is cheap (analysis model) and always useful. Requiring manual evaluation adds friction without benefit. Users can ignore scores but always have them available for comparison.

**Why these 6 dimensions:** They cover the key aspects of writing quality that are machine-assessable: structural clarity, adherence to style guide, information coverage, readability, and factual grounding. `overall_score` is a weighted composite for quick comparison.

### 3. Promotion flow

**Choice:** User-initiated promotion of any node to `final.md`:

1. User selects a node (any node, regardless of score)
2. `POST /api/articles/[slug]/promote` with `{ nodeId: string }`
3. Server copies node content to `/data/articles/[slug]/final.md`
4. Updates `meta.md` status to `"final"`

**Why no auto-promote:** Auto-promoting the highest-scored node removes user agency. Scores are advisory — the user may prefer a lower-scored node for reasons the model can't assess (tone, audience fit, personal preference).

### 4. Retroactive auto-evaluate on generate

**Choice:** Phase 1's generate endpoint now auto-triggers evaluation after v1 is written. This is wired up in this phase by calling the evaluation service at the end of the generate flow.

**Why retroactive:** Generate was built before evaluation existed. Now that evaluation is available, every new v1 should be scored immediately so the user has context from the start.

### 5. API design

```
POST /api/articles/[slug]/branch
  body: { instruction: string }
  → 200: streaming response (same as generate)
  → 409: if max siblings reached or node is depth-2

POST /api/articles/[slug]/optimize
  body: { nodeId: string, instruction: string }
  → 200: streaming response
  → 404: node not found

POST /api/articles/[slug]/promote
  body: { nodeId: string }
  → 200: { finalPath: string }
  → 404: node not found

POST /api/evaluate/node
  body: { slug: string, nodeId: string }
  → 200: EvaluationScores

GET  /api/evaluate/[slug]/[node]
  → 200: EvaluationScores
  → 404: evaluation not found
```

Branch and optimize return streaming responses (same pattern as generate) so the UI can show real-time output. Evaluation is triggered server-side after the stream completes.

## Risks / Trade-offs

- **Evaluation latency after generation**: Auto-evaluation adds a second LLM call after every generation. The user sees the content immediately (streaming), but scores appear after a delay. → Mitigation: show a loading state for evaluation scores; they are non-blocking.

- **bestNode flicker on rapid operations**: If a user branches twice quickly, `bestNode` may update between operations. → Mitigation: `bestNode` is recalculated after each evaluation completes, always reflecting the latest scores. UI should treat it as eventually consistent.

- **Optimize destroys content**: In-place rewrite with no undo. → Mitigation: UI must show a clear confirmation dialog with "irreversible" warning. The branch operation is the safe alternative.

- **4-sibling limit may feel restrictive**: Power users may want more variants. → Mitigation: 4 is sufficient for meaningful comparison without overwhelming the UI. Can be made configurable later if needed.

## UX Contract

- The version tree must visually distinguish `bestNode` from other nodes (highlight only, never auto-promote).
- Evaluation display must clearly communicate "advisory only"; users can still promote any node.
- `branch` and `optimize` must remain explicit user actions with clear labels:
  - `branch`: "create a new v2-x variant from v1"
  - `optimize`: "in-place rewrite on the selected node (irreversible)"
- Promote interaction must require explicit user intent on a selected node (no score-based auto-promotion path).
- After generate/branch/optimize, evaluation refresh should be visible in the node context the user is viewing.

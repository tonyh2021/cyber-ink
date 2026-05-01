## Why

After Phase 2, users can only generate a single v1 draft. There is no way to explore alternative directions, compare quality, or finalize an article. The core CyberInk writing loop — generate → branch → evaluate → compare → promote — is incomplete without branching, evaluation, and promotion.

## What Changes

- Implement branching system with 2-level cap: fork v1 → v2-x variants (max 4 siblings), depth-2 nodes cannot branch further
- Add optimize operation: irreversible in-place rewrite on any node (v1 or v2-x)
- Auto-evaluate every generation/branch/optimize using the analysis model — scores written to `/evaluation/[node].json`
- Auto-update `bestNode` in tree.json after each evaluation (highest overall_score)
- Implement promotion flow: user selects any node → copy to `final.md` → update meta.md status
- Retroactively wire Phase 1's generate endpoint to auto-trigger evaluation after v1 is written

## Capabilities

### New Capabilities

- `branching`: Fork v1 into v2-x variants with 2-level depth cap and max 4 siblings; branch uses Prompt Builder with raw material + user's branch instruction
- `optimize`: In-place irreversible rewrite on any node (v1 or v2-x), triggers auto-evaluation after completion
- `node-evaluation`: Auto-triggered evaluation after every generate/branch/optimize — scores clarity, style_match, information_density, reader_engagement, hallucination_risk, overall_score (0–1 floats) using the analysis model
- `promotion`: User-initiated promotion of any node to final.md regardless of score; updates meta.md status to "final"

### Modified Capabilities

_(none)_

## Impact

- **Code**: New API routes for branch, optimize, promote, evaluate; workspace UI updates for tree visualization, evaluation display, promotion flow
- **APIs**: `POST .../branch`, `POST .../optimize`, `POST .../promote`, `POST /api/evaluate/node`, `GET /api/evaluate/[slug]/[node]`
- **Dependencies**: No new dependencies
- **Data**: New `/evaluation/[node].json` files per article; `tree.json` gains `bestNode` field
- **Risk**: Medium — branching rules (depth cap, sibling limit) and evaluation auto-trigger require careful state management in tree.json

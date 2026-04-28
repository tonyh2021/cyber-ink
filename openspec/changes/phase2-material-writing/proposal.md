# Phase 2 — Material Ingestion & Writing

## Summary

Implement the material ingestion pipeline (text paste + Tavily search + dehydration) and the core writing system (Prompt Builder + Generation Engine). After this phase, users can ingest material, dehydrate it into a semantic kernel, and generate a first draft (v1).

## Depends on

- Phase 1 (data layer, article CRUD, config, profile)

## Scope

### Material Input

Two input sources:
- **Text paste** — user pastes raw material directly
- **Tavily search** — search query returns relevant content

### Dehydration Engine

Extracts semantic kernel from raw material → writes `source.md` (bound to article, not shared across articles).

**source.md structure:**

```yaml
---
dehydratedAt: "2025-01-01"
---

## core_ideas
- ...

## arguments
- ...

## facts
- ...

## quotes
- ...

## entities
- ...

## quality_flags
- noise | bias | redundancy
```

Positioning: Semantic Writing Kernel — "semantic fuel" for writing, not a summary. Uses the `analysis` model role.

### Prompt Builder

```ts
build({
  profile,       // Channel identity (from /profiles/default.md)
  style,         // Active style version content (from /styles/)
  source,        // Dehydrated semantic kernel (source.md)
  instruction,   // User additional instruction
  language,      // zh | en
  output_format  // Output format requirements
})
// Output: Deterministic System Prompt
```

**Deterministic:** same inputs must produce the same system prompt. No randomness.

### Generation Engine

Uses the `writing` model role for streaming generation.

**Generate flow:**
1. Load profile, active style, source.md
2. Prompt Builder assembles system prompt
3. Writing model generates content (streaming)
4. Write output → `/nodes/v1.md`
5. Update `tree.json`:

```json
{
  "rootNode": "v1",
  "bestNode": "v1",
  "latestNode": "v1",
  "nodes": {
    "v1": { "parent": null, "depth": 1, "children": [] }
  }
}
```

### UX Contract (Phase 2)

- Material input must expose two explicit entry paths with clear intent labels:
  - paste raw text
  - search and import results
- Dehydration is a user-triggered step; completion must be visible before generation starts.
- Generation must present streaming output feedback so users can perceive progress while content is being produced.
- The first successful generation must establish a visible `v1` node context (not hidden as a background-only write).
- Prompt customization inputs (`instruction`, `language`, `output_format`) must be explicit and user-controlled.
- If required inputs are missing (for example, no usable material), the UI should block generate with actionable guidance.

### APIs

```
POST /api/material/dehydrate              # Dehydrate raw material → source.md
POST /api/material/search                 # Tavily search
POST /api/articles/[slug]/generate        # Generate v1 (streaming)
```

## Non-goals

- No branching or optimize yet (Phase 3)
- No auto-evaluation after generation yet (Phase 3)
- No style management (Phase 4) — uses whatever active style exists

# Phase 1 — Foundation & Data Layer

## Summary

Set up Next.js project scaffolding, data directory structure, config system, profile, and basic article CRUD. This phase establishes the persistence layer and the skeleton that all subsequent phases build on.

## Motivation

Every other feature depends on the filesystem data layer and config system being in place. Article CRUD is the backbone — create an article workspace, read its aggregated state, delete it.

## Scope

### Project Setup

- Next.js App Router project initialization
- Vercel AI SDK, gray-matter, react-diff-viewer-continued, tavily-sdk dependencies
- `.env` for API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, TAVILY_API_KEY)

### Data Directory Structure

```
/data/
  config.json                          # Model configuration
  /profiles/
    default.md                         # Channel identity (read-only)
  /styles/                             # Prepared for Phase 4
  /articles/                           # Article workspaces
```

### config.json

```json
{
  "models": {
    "writing": {
      "provider": "anthropic",
      "model": "claude-sonnet-4-5"
    },
    "analysis": {
      "provider": "openai",
      "model": "gpt-4o-mini"
    }
  }
}
```

Two model roles: `writing` (main generation) and `analysis` (evaluation, scoring, style extraction).

### Profile

`/data/profiles/default.md` — channel identity, target audience, writing tone. Read-only, loaded by Prompt Builder in Phase 2.

### Article CRUD

**Create article** — initializes the workspace:

```
/data/articles/[slug]/
  source.md          # Empty, populated in Phase 2
  meta.md            # Metadata with YAML frontmatter
  tree.json          # Empty tree structure
  /nodes/            # Empty, populated in Phase 2
  /evaluation/       # Empty, populated in Phase 3
```

**meta.md structure:**

```yaml
---
title: "..."
slug: "..."
language: "zh"            # zh | en
status: "draft"           # draft | final
styleRef: "tech-vibe"
styleVersion: "v2"
createdAt: "..."
updatedAt: "..."
---
```

**tree.json initial state:**

```json
{
  "rootNode": null,
  "bestNode": null,
  "latestNode": null,
  "nodes": {}
}
```

**Delete article** — removes the entire `/data/articles/[slug]/` directory.

**Get article (aggregated)** — returns tree.json + all node contents + all evaluation scores + meta.md in a single response.

### APIs

```
POST   /api/articles                      # Create article workspace
DELETE /api/articles/[slug]               # Delete article
GET    /api/articles/[slug]               # Aggregated: tree + nodes + evals + meta
GET    /api/profiles/default              # Read profile content
```

## Non-goals

- No generation, evaluation, or branching logic yet
- No style system setup beyond empty directory
- No UI (API-only in this phase)

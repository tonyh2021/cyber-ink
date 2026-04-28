# AGENTS.md

Instructions for AI agents working on the CyberInk project.

## Context

CyberInk is a Markdown-native AI writing decision engine. PRD version: v3.3. Read CLAUDE.md for full architecture, data layout, and API surface.

## General Principles

- Read CLAUDE.md before making changes.
- Understand existing file structure and patterns before adding code.
- Prefer editing existing files over creating new ones.
- One concern per commit. Keep changes minimal and focused.
- Do not introduce dependencies without justification.

## Domain Rules

- **Branching is 2-level max.** Never allow depth-2 nodes to create children. Max 4 sibling branches.
- **Evaluation is advisory only.** Never auto-promote based on scores. Promote is always user-initiated.
- **Filesystem is the database.** All persistence uses Markdown files + JSON. No external DB.
- **Style versions are immutable.** New style = new `vN.md` file. Never overwrite existing versions.
- **`tree.json` is the source of truth** for node relationships, bestNode, and latestNode.
- **Prompt Builder output must be deterministic** — same inputs produce the same system prompt.
- **API keys live in `.env` only.** Model selection lives in `/data/config.json`. Never mix the two.

## Code Standards

- Language: English for all code, comments, documentation, and UI copy.
- Follow Next.js App Router conventions.
- Use Vercel AI SDK patterns for streaming generation.
- Parse Markdown frontmatter with gray-matter.
- Evaluation scores are 0–1 floats, stored as JSON.

## Working with the Data Layer

- When creating articles: initialize `source.md`, `meta.md`, `tree.json`, and `/nodes/` + `/evaluation/` directories.
- When generating/branching: write the node file, update `tree.json`, then trigger evaluation.
- When promoting: copy node content to `final.md` and update `meta.md` status to "final".
- When saving feedback: write to `/data/styles/[style-name]/feedback/` with correct naming (`[slug]-[node].md` or `[slug]-[node]-para.md`).

## Commit Guidelines

- Concise messages focused on "why" not "what".
- One logical change per commit.
- Never commit `.env`, generated files, or `/data/` user content to version control.

## When Uncertain

- If requirements are ambiguous, ask for clarification rather than guessing.
- If a change affects the branching model, evaluation flow, or data schema, flag it before proceeding.

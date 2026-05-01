# AGENTS.md

Instructions for AI agents working on the CyberInk project.

## Context

CyberInk is a Markdown-native AI writing decision engine with version exploration and multi-round polish. Read CLAUDE.md for full architecture, data layout, and API surface.

## General Principles

- Read CLAUDE.md before making changes.
- Understand existing file structure and patterns before adding code.
- Prefer editing existing files over creating new ones.
- One concern per commit. Keep changes minimal and focused.
- Do not introduce dependencies without justification.

## Domain Rules

- **Versions are sequential and capped at 5.** Generate creates v1, v2, v3, ... — oldest is pruned when the limit is reached.
- **Polish is multi-round conversational editing.** User can apply any round by index or revert to original. Polish sessions are temporary and removed on apply/discard.
- **Filesystem is the database.** All persistence uses Markdown files + JSON. No external DB.
- **`tree.json` is the source of truth** for node relationships (rootNode, bestNode, latestNode, nodes).
- **Prompt content lives in `/data/` files.** The prompt builder (`src/lib/prompt-builder.ts`) only handles structure — never hardcode prompt text in code.
- **Prompt Builder output must be deterministic** — same inputs produce the same system prompt.
- **API keys live in `.env` only.** Model selection lives in `/data/config.json`. Never mix the two.

## Code Standards

- Language: English for all code, comments, documentation, and UI copy.
- Follow Next.js App Router conventions.
- Use Vercel AI SDK patterns for streaming generation.
- Parse Markdown frontmatter with gray-matter.

## Working with the Data Layer

- When creating articles: initialize `source.md`, `meta.json`, `tree.json`, and `/nodes/` directory.
- When generating: write the node file, update `tree.json`, prune oldest version if over limit.
- When polishing: session state lives in `/articles/[slug]/.polish/` — target, original, rounds, history.
- When applying polish: write chosen round content back to the node file, remove `.polish/` directory.

## Commit Guidelines

- Concise messages focused on "why" not "what".
- One logical change per commit.
- Never commit `.env`, generated files, or `/data/` user content to version control.

## When Uncertain

- If requirements are ambiguous, ask for clarification rather than guessing.
- If a change affects the version model, polish flow, or data schema, flag it before proceeding.

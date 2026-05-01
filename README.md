# CyberInk

A file-system-based AI writing decision engine with version exploration and multi-round polish.

> Writing Decision Engine with Conversational Polish

## Core Principles

Control-first · Source-driven · Markdown-native · Version-structured

## What It Does

CyberInk generates multiple drafts from raw material, lets you polish content through conversational editing, and apply the version you prefer. Writing style is guided by reference articles — the system extracts their techniques and applies them to your content direction.

**You always have the final say.**

## How It Works

```
Source material (paste)
    ↓
Prompt Builder (profile + references + instruction + output rules)
    ↓
Generation Engine → v1.md, v2.md, ... (max 5, oldest pruned)
    ↓
Polish Engine → multi-round conversational editing
    ↓
User applies preferred round
```

### Version Model

- **generate** — Creates sequential versions (v1, v2, v3, ...) from source material
- **polish** — Multi-round in-place editing of a selected version; apply any round or discard

## Tech Stack

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Framework        | Next.js (App Router)                             |
| AI SDK           | Vercel AI SDK                                    |
| Writing Model    | Claude (configurable)                            |
| Markdown Parsing | gray-matter                                      |
| Diff Rendering   | react-diff-viewer-continued                      |
| Config           | `.env` (API keys) + `/data/config.json` (models) |

## Project Structure

```
/data/
  config.json                            # Model configuration + language
  /profiles/default.md                   # Channel identity
  /instruction/
    instruction.md                       # Writing style instruction
    output-rules.md                      # Output format rules
    polish-prompt.md                     # Polish assistant system prompt
  /references/[group-name]/
    1.md, 2.md, ...                      # Reference articles for technique extraction
  /articles/[slug]/
    source.md                            # Raw material (user-pasted text)
    meta.json                            # Article metadata
    tree.json                            # Version structure
    /nodes/v1.md, v2.md, ...             # Generated content nodes
    /.polish/                            # Active polish session (temporary)
```

## API

### Article

```
POST   /api/articles                     # Create article
DELETE /api/articles/[slug]              # Delete article
GET    /api/articles/[slug]              # Aggregated: tree + nodes + meta
POST   /api/articles/[slug]/generate     # Generate new version
```

### Polish

```
POST   /api/articles/[slug]/polish/start     # Start polish session
POST   /api/articles/[slug]/polish/round     # Send a polish round
GET    /api/articles/[slug]/polish/status    # Get session status
POST   /api/articles/[slug]/polish/apply     # Apply a round
POST   /api/articles/[slug]/polish/discard   # Discard session
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your API key: ANTHROPIC_API_KEY

# Start development server
pnpm dev
```

## License

MIT

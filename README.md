# CyberInk

A file-system-based AI writing decision engine with branching exploration, auto-evaluation, and style self-learning.

> Writing Decision Engine with Style Feedback Loop

## Core Principles

Control-first · Material-driven · Markdown-native · Evaluation-looped · Tree-structured · Self-improving

## What It Does

CyberInk treats content generation as a **search problem over a finite semantic space**. You feed in raw material, the system extracts a semantic kernel, generates tree-structured drafts, evaluates quality, and lets you promote the best version — all while your style fingerprint evolves through feedback.

**You always have the final say.** Scores guide; you decide.

## How It Works

```
Material (paste / search)
    ↓
Dehydration Engine → source.md (semantic kernel)
    ↓
Prompt Builder (profile + style + source + instruction)
    ↓
Generation Engine → v1.md
    ↓
Auto-Evaluation → scores (advisory)
    ↓
Branch / Optimize (2-level tree, max 4 siblings)
    ↓
User promotes → final.md
```

### Branching Model

```
v1                ← Root generation
├── v2-a          ← Branch (fork from v1)
├── v2-b          ← Branch
└── v2-c          ← Branch (max 4)
```

- **generate** — First generation creates `v1`
- **branch** — Fork `v1` into `v2-x` variants (depth-2 nodes cannot branch further)
- **optimize** — In-place rewrite on any node

### Style Feedback Loop

```
User marks good content → feedback stored
                              ↓
External articles + feedback (few-shot examples)
                              ↓
GPT-4o-mini extracts style fingerprint → new vN.md
                              ↓
Style evolves over time
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| AI SDK | Vercel AI SDK |
| Writing Model | Claude (configurable) |
| Analysis / Evaluation | GPT-4o-mini (configurable) |
| Markdown Parsing | gray-matter |
| Diff Rendering | react-diff-viewer-continued |
| Search | tavily-sdk |
| Config | `.env` (API keys) + `/data/config.json` (models) |

## Project Structure

```
/data/
  config.json                            # Model configuration
  /profiles/default.md                   # Channel identity
  /styles/[style-name]/
    v1.md, v2.md, active.md              # Style versions
    /feedback/                           # User-marked good content
  /articles/[slug]/
    source.md                            # Dehydrated material
    meta.md                              # Article metadata
    tree.json                            # Branch structure + bestNode
    final.md                             # Promoted final version
    /nodes/v1.md, v2-a.md, ...           # Generated content
    /evaluation/v1.json, v2-a.json, ...  # Quality scores
```

## API

### Writing

```
POST   /api/articles                    # Create article
DELETE /api/articles/[slug]             # Delete article
GET    /api/articles/[slug]              # Aggregated: tree + nodes + evals + meta
POST   /api/articles/[slug]/generate    # Generate v1
POST   /api/articles/[slug]/branch      # Fork v1 → v2-x
POST   /api/articles/[slug]/optimize    # In-place optimize
POST   /api/articles/[slug]/promote     # Promote → final.md
```

### Evaluation

```
POST   /api/evaluate/node               # Evaluate a node
GET    /api/evaluate/[slug]/[node]       # Get node scores
```

### Style

```
GET    /api/styles                       # List all styles
GET    /api/styles/active               # Get active style
POST   /api/styles/regenerate           # Regenerate with feedback
POST   /api/styles/set-active           # Switch active version
```

### Feedback

```
POST   /api/feedback                    # Submit feedback
GET    /api/feedback                    # List all feedback
DELETE /api/feedback/[id]               # Delete feedback
```

### Material

```
POST   /api/material/dehydrate          # Extract semantic kernel
POST   /api/material/search             # Tavily search
```

## Evaluation Dimensions

| Metric | Description |
|--------|------------|
| clarity | Writing clarity and readability |
| style_match | Alignment with active style fingerprint |
| information_density | How well source material is utilized |
| reader_engagement | Hook and flow quality |
| hallucination_risk | Deviation from source facts (lower = better) |
| overall_score | Weighted composite score |

All scores are `0–1` floats. Evaluation is **advisory only** — the highest-scoring node is highlighted in UI, but promotion is always the user's choice.

## Getting Started

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your API keys: ANTHROPIC_API_KEY, OPENAI_API_KEY, TAVILY_API_KEY

# Start development server
pnpm dev
```

## License

MIT
